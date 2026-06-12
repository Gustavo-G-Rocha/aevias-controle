/**
 * useEnsaioCAUQForm.js
 *
 * Hook responsável por toda a lógica de estado e cálculos automáticos do
 * formulário de Ensaio CAUQ. Centraliza:
 *   - handlers de campos simples e aninhados
 *   - derivação de dados ao trocar de projeto (faixa, ligante, pedreira)
 *   - efeitos de cálculo automático (extração, Rice, filler/betume, Marshall)
 *   - CRUD de corpos de prova Marshall
 *   - submit (rascunho e finalizado)
 *
 * Não importa nem renderiza nenhum componente React.
 */

import { useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { validateEnsaioCAUQ, validateEnsaioRascunho } from "@/utils/ensaioValidation";

/** Tabela de correção de estabilidade Marshall por espessura (DNIT) */
const TABELA_CORRECAO_ESTABILIDADE = [
  [50.8,1.47],[51.0,1.45],[51.2,1.44],[51.6,1.43],[51.8,1.42],
  [52.0,1.41],[52.2,1.40],[52.4,1.39],[52.6,1.38],[52.9,1.37],
  [53.1,1.36],[53.3,1.35],[53.5,1.34],[53.8,1.33],[54.0,1.32],
  [54.2,1.31],[54.5,1.30],[54.7,1.29],[54.9,1.28],[55.1,1.27],
  [55.4,1.26],[55.6,1.25],[55.8,1.24],[56.1,1.23],[56.3,1.22],
  [56.6,1.21],[56.8,1.20],[57.2,1.19],[57.4,1.18],[57.7,1.18],
  [58.1,1.16],[58.4,1.15],[58.7,1.14],[59.0,1.13],[59.3,1.12],
  [59.7,1.11],[60.0,1.10],[60.3,1.09],[60.6,1.08],[60.9,1.07],
  [61.1,1.06],[61.4,1.05],[61.9,1.04],[62.3,1.03],[62.7,1.02],
  [63.1,1.01],[63.5,1.00],[63.9,0.99],[64.3,0.98],[64.7,0.97],
  [65.1,0.96],[65.6,0.95],[66.1,0.94],[66.7,0.93],[67.1,0.92],
  [67.5,0.91],[67.9,0.90],[68.3,0.89],[68.8,0.88],[69.3,0.87],
  [69.9,0.86],[70.3,0.85],[70.8,0.84],[71.4,0.83],[72.2,0.82],
  [73.0,0.81],[73.5,0.80],[74.0,0.79],[74.6,0.78],[75.4,0.77],
  [76.2,0.76],
];

/** Interpolação linear na tabela de correção de estabilidade */
function getFatorCorrecaoEstabilidade(alturaMm) {
  const t = TABELA_CORRECAO_ESTABILIDADE;
  if (alturaMm <= t[0][0]) return t[0][1];
  if (alturaMm >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    if (alturaMm >= t[i][0] && alturaMm <= t[i + 1][0]) {
      const [x0, y0] = t[i];
      const [x1, y1] = t[i + 1];
      return y0 + ((alturaMm - x0) * (y1 - y0)) / (x1 - x0);
    }
  }
  return 1.0;
}

/** Template de corpo de prova vazio */
export const novoCorpoProva = (numero) => ({
  numero,
  metodo_rompimento: "estabilidade_fluencia",
  peso_ar: null, peso_imerso: null, peso_sss: null,
  volume: null, densidade_aparente: null, volume_vazios: null,
  vcb: null, vam: null, rbv: null,
  altura: null, const_prensa: 1.0,
  rtcd_leitura: null, rtcd_valor: null,
  estabilidade_leitura: null, estabilidade_corrigida: null,
  fluencia_leitura_inicial: null, fluencia_leitura_final: null, fluencia: null,
});

export function useEnsaioCAUQForm({
  formData,
  setFormData,
  projects,
  faixas,
  editingEnsaio,
  setEditingEnsaio,
  user,
  setSaving,
  clearSavedData,
  navigate,
}) {

  // ── handlers simples ────────────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleNestedChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, [setFormData]);

  // ── seleção de projeto ───────────────────────────────────────────────────────
  const handleProjectChange = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) { setFormData(prev => ({ ...prev, project_id: "" })); return; }

    const faixa = faixas.find(f => f.id === project.faixa_granulometrica_id);
    const pedreira = (project.agregados || [])
      .map(ag => ag.pedreira).filter(Boolean)
      .filter((p, i, arr) => arr.indexOf(p) === i)
      .join(", ");

    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      faixa_especificada: faixa ? faixa.nome : "Não definida",
      tipo_ligante: project.ligante?.tipo || "",
      pedreira,
    }));
  }, [projects, faixas, setFormData]);

  // ── cálculo automático: extração de ligante ─────────────────────────────────
  useEffect(() => {
    const ext = formData.extracao_ligante;

    if (formData.realizar_ensaio_umidade && ext.amostra_umida && ext.amostra_seca) {
      const umidade = ((ext.amostra_umida - ext.amostra_seca) / ext.amostra_seca) * 100;
      handleNestedChange('extracao_ligante', 'umidade', parseFloat(umidade.toFixed(2)));
    }

    if (ext.amostra_com_ligante && ext.amostra_sem_ligante && ext.fator_correcao) {
      const pesoLigante = (ext.amostra_com_ligante - ext.amostra_sem_ligante) * ext.fator_correcao;
      const teorLigante = (pesoLigante / ext.amostra_com_ligante) * 100;
      handleNestedChange('extracao_ligante', 'peso_ligante', parseFloat(pesoLigante.toFixed(2)));
      handleNestedChange('extracao_ligante', 'teor_ligante', parseFloat(teorLigante.toFixed(2)));

      const teorReal = formData.realizar_ensaio_umidade && ext.umidade
        ? teorLigante - ext.umidade
        : teorLigante;
      handleNestedChange('extracao_ligante', 'teor_ligante_real', parseFloat(teorReal.toFixed(2)));
    }
  }, [
    formData.realizar_ensaio_umidade,
    formData.extracao_ligante.amostra_umida,
    formData.extracao_ligante.amostra_seca,
    formData.extracao_ligante.amostra_com_ligante,
    formData.extracao_ligante.amostra_sem_ligante,
    formData.extracao_ligante.fator_correcao,
    handleNestedChange,
  ]);

  // ── cálculo automático: densidade Rice ──────────────────────────────────────
  useEffect(() => {
    if (!formData.realizar_densidade_rice) return;
    const rice = formData.densidade_rice;
    if (rice.frasco_agua && rice.amostra && rice.frasco_agua_amostra && rice.densidade_agua) {
      const densRice = (rice.amostra * rice.densidade_agua) / (rice.frasco_agua + rice.amostra - rice.frasco_agua_amostra);
      handleNestedChange('densidade_rice', 'densidade_rice', parseFloat(densRice.toFixed(3)));
    }
  }, [
    formData.realizar_densidade_rice,
    formData.densidade_rice.frasco_agua,
    formData.densidade_rice.amostra,
    formData.densidade_rice.frasco_agua_amostra,
    formData.densidade_rice.densidade_agua,
    handleNestedChange,
  ]);

  // ── cálculo automático: filler/betume ───────────────────────────────────────
  useEffect(() => {
    const teorReal = formData.extracao_ligante.teor_ligante_real;
    const pesoRetido200 = formData.granulometria.peso_retido_peneiras?.peneira_0_075mm;

    if (teorReal && pesoRetido200 != null) {
      const pesoTotal = Object.values(formData.granulometria.peso_retido_peneiras || {})
        .reduce((sum, val) => sum + (val || 0), 0);

      if (pesoTotal > 0) {
        const pct200 = (pesoRetido200 / pesoTotal) * 100;
        const fillerBetume = pct200 / teorReal;
        handleNestedChange('extracao_ligante', 'filler_betume', parseFloat(fillerBetume.toFixed(2)));
      }
    }
  }, [
    formData.extracao_ligante.teor_ligante_real,
    formData.granulometria.peso_retido_peneiras,
    handleNestedChange,
  ]);

  // ── corpos de prova Marshall ─────────────────────────────────────────────────
  const adicionarCorpoProva = useCallback(() => {
    setFormData(prev => {
      if (prev.corpos_prova_marshall.length >= 6) return prev;
      return {
        ...prev,
        corpos_prova_marshall: [
          ...prev.corpos_prova_marshall,
          novoCorpoProva(prev.corpos_prova_marshall.length + 1),
        ],
      };
    });
  }, [setFormData]);

  const removerCorpoProva = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      corpos_prova_marshall: prev.corpos_prova_marshall.filter((_, i) => i !== index),
    }));
  }, [setFormData]);

  /**
   * Atualiza um campo de CP e recalcula todos os valores derivados:
   * volume, densidade aparente, vazios, VCB, VAM, RBV, RTCD, estabilidade, fluência.
   */
  const handleCorpoProvaChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newCPs = [...prev.corpos_prova_marshall];
      const cp = { ...newCPs[index], [field]: value };

      // Volume, densidade aparente, vazios, VCB, VAM, RBV
      if (cp.peso_ar && cp.peso_imerso && cp.peso_sss) {
        cp.volume = parseFloat((cp.peso_sss - cp.peso_imerso).toFixed(2));
        cp.densidade_aparente = parseFloat(((cp.peso_ar * 0.9971) / cp.volume).toFixed(3));

        if (prev.realizar_densidade_rice && prev.densidade_rice.densidade_rice) {
          cp.volume_vazios = parseFloat((100 * (1 - cp.densidade_aparente / prev.densidade_rice.densidade_rice)).toFixed(1));
        }

        if (prev.extracao_ligante.teor_ligante_real && cp.densidade_aparente) {
          cp.vcb = parseFloat(((cp.densidade_aparente * prev.extracao_ligante.teor_ligante_real) / 1.030).toFixed(2));
          if (cp.volume_vazios != null && cp.vcb != null) {
            cp.vam = parseFloat((cp.vcb + cp.volume_vazios).toFixed(2));
            if (cp.vam > 0) cp.rbv = parseFloat(((cp.vcb / cp.vam) * 100).toFixed(2));
          }
        }
      }

      // RTCD (diametral)
      if (cp.metodo_rompimento === 'diametral' && cp.rtcd_leitura && cp.altura && cp.const_prensa) {
        cp.rtcd_valor = parseFloat((((cp.rtcd_leitura * 2) / (10 * cp.altura * 3.1416)) * 0.098 * cp.const_prensa).toFixed(2));
      }

      // Estabilidade e Fluência
      if (cp.metodo_rompimento === 'estabilidade_fluencia') {
        if (cp.estabilidade_leitura && cp.const_prensa && cp.altura) {
          const fator = getFatorCorrecaoEstabilidade(cp.altura * 10);
          cp.estabilidade_corrigida = parseFloat((cp.estabilidade_leitura * fator * cp.const_prensa).toFixed(1));
        }
        if (cp.fluencia_leitura_inicial != null && cp.fluencia_leitura_final != null) {
          cp.fluencia = parseFloat((cp.fluencia_leitura_final - cp.fluencia_leitura_inicial).toFixed(2));
        }
      }

      newCPs[index] = cp;
      return { ...prev, corpos_prova_marshall: newCPs };
    });
  }, [setFormData]);

  // ── salvar progresso (rascunho) ──────────────────────────────────────────────
  const handleSaveProgress = useCallback(async () => {
    const validation = validateEnsaioRascunho(formData);
    if (!validation.valid) { alert(validation.message); return; }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "rascunho",
        laboratorista_name: user?.laboratorista_name || user?.full_name,
      };

      if (editingEnsaio?.id) {
        await base44.entities.EnsaioCAUQ.update(editingEnsaio.id, dataToSave);
        alert("Progresso salvo com sucesso!");
      } else {
        const newEnsaio = await base44.entities.EnsaioCAUQ.create(dataToSave);
        setEditingEnsaio(newEnsaio);
        alert("Progresso salvo com sucesso!");
      }
      clearSavedData();
    } catch (error) {
      console.error("[EnsaioCAUQ] Erro ao salvar progresso:", error?.message || error);
      alert("Erro ao salvar progresso.");
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, setEditingEnsaio, user, setSaving, clearSavedData]);

  // ── finalizar ensaio ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validation = validateEnsaioCAUQ(formData);
    if (!validation.valid) { alert(validation.message); return; }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "finalizado",
        laboratorista_name: user?.laboratorista_name || user?.full_name,
      };

      if (editingEnsaio?.id) {
        const updateData = { ...dataToSave };
        if (editingEnsaio.approved === false) {
          updateData.approved = null;
          updateData.rejection_reason = null;
          updateData.approved_by = null;
          updateData.approved_date = null;
          await base44.entities.EnsaioCAUQ.update(editingEnsaio.id, updateData);
          alert("Ensaio finalizado com sucesso! O registro voltará para análise.");
        } else {
          await base44.entities.EnsaioCAUQ.update(editingEnsaio.id, updateData);
          alert("Ensaio finalizado com sucesso!");
        }
      } else {
        await base44.entities.EnsaioCAUQ.create(dataToSave);
        alert("Ensaio criado e finalizado com sucesso!");
      }
      clearSavedData();
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      console.error("[EnsaioCAUQ] Erro ao finalizar ensaio:", error?.message || error);
      alert("Erro ao finalizar ensaio.");
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, user, setSaving, clearSavedData, navigate]);

  return {
    handleChange,
    handleNestedChange,
    handleProjectChange,
    adicionarCorpoProva,
    removerCorpoProva,
    handleCorpoProvaChange,
    handleSaveProgress,
    handleSubmit,
  };
}