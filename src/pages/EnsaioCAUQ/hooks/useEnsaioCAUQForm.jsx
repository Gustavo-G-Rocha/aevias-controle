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
import { useQueryClient } from "@tanstack/react-query";
import { criarEnsaio, atualizarEnsaio } from "@/services/ensaiosService";
import { QUERY_KEYS } from "@/hooks/useQueryData";
import { createPageUrl } from "@/utils";
import { validateEnsaioCAUQ, validateEnsaioRascunho } from "@/utils/ensaioValidation";
import { getFatorCorrecaoEstabilidade, novoCorpoProva } from "@/utils/ensaioCAUQCalculations";
import { toast } from "@/components/ui/use-toast";
import { logger } from '@/utils/logger';

// Reexporta para preservar a API pública do hook (outros módulos importam novoCorpoProva daqui).
export { novoCorpoProva };



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
  const queryClient = useQueryClient();

  // ── handlers simples ────────────────────────────────────────────────────────
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleNestedChange = useCallback((section, field, valueOrUpdater) => {
    setFormData(prev => {
      const currentValue = prev[section]?.[field];
      const newValue = typeof valueOrUpdater === 'function'
        ? valueOrUpdater(currentValue)
        : valueOrUpdater;
      return {
        ...prev,
        [section]: { ...prev[section], [field]: newValue },
      };
    });
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
    const amostraUmida = parseFloat(ext.amostra_umida);
    const amostraSeca = parseFloat(ext.amostra_seca);
    const amostraComLigante = parseFloat(ext.amostra_com_ligante);
    const amostraSemLigante = parseFloat(ext.amostra_sem_ligante);
    const fatorCorrecao = parseFloat(ext.fator_correcao);

    if (formData.realizar_ensaio_umidade && amostraUmida && amostraSeca) {
      const umidade = ((amostraUmida - amostraSeca) / amostraSeca) * 100;
      handleNestedChange('extracao_ligante', 'umidade', parseFloat(umidade.toFixed(2)));
    }

    if (amostraComLigante && amostraSemLigante && fatorCorrecao) {
      const pesoLigante = (amostraComLigante - amostraSemLigante) * fatorCorrecao;
      const teorLigante = (pesoLigante / amostraComLigante) * 100;
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
  // Fórmula: (% PASSANTE na peneira 200) / (Teor de ligante real)
  useEffect(() => {
    const teorReal = formData.extracao_ligante.teor_ligante_real;
    const amostraSemLigante = formData.extracao_ligante.amostra_sem_ligante;

    if (teorReal && amostraSemLigante > 0) {
      const somaRetidos = Object.values(formData.granulometria.peso_retido_peneiras || {})
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

      const pctPassante200 = ((amostraSemLigante - somaRetidos) / amostraSemLigante) * 100;
      const fillerBetume = pctPassante200 / teorReal;
      handleNestedChange('extracao_ligante', 'filler_betume', parseFloat(fillerBetume.toFixed(2)));
    }
  }, [
    formData.extracao_ligante.teor_ligante_real,
    formData.extracao_ligante.amostra_sem_ligante,
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
    if (!validation.valid) { toast({ title: validation.message, variant: "destructive" }); return; }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        status: "rascunho",
        laboratorista_name: user?.laboratorista_name || user?.full_name,
      };

      if (editingEnsaio?.id) {
        await atualizarEnsaio('EnsaioCAUQ', editingEnsaio.id, dataToSave);
        toast({ title: "Progresso salvo com sucesso!" });
      } else {
        const newEnsaio = await criarEnsaio('EnsaioCAUQ', dataToSave);
        setEditingEnsaio(newEnsaio);
        toast({ title: "Progresso salvo com sucesso!" });
      }
      clearSavedData();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
    } catch (error) {
      logger.error("[EnsaioCAUQ] Erro ao salvar progresso:", error?.message || error);
      toast({ title: "Erro ao salvar progresso.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, setEditingEnsaio, user, setSaving, clearSavedData, queryClient]);

  // ── finalizar ensaio ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validation = validateEnsaioCAUQ(formData);
    if (!validation.valid) { toast({ title: validation.message, variant: "destructive" }); return; }

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
          await atualizarEnsaio('EnsaioCAUQ', editingEnsaio.id, updateData);
          toast({ title: "Ensaio finalizado com sucesso! O registro voltará para análise." });
        } else {
          await atualizarEnsaio('EnsaioCAUQ', editingEnsaio.id, updateData);
          toast({ title: "Ensaio finalizado com sucesso!" });
        }
      } else {
        await criarEnsaio('EnsaioCAUQ', dataToSave);
        toast({ title: "Ensaio criado e finalizado com sucesso!" });
      }
      clearSavedData();
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allRecords });
      navigate(createPageUrl('MeusEnsaios'));
    } catch (error) {
      logger.error("[EnsaioCAUQ] Erro ao finalizar ensaio:", error?.message || error);
      toast({ title: "Erro ao finalizar ensaio.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [formData, editingEnsaio, user, setSaving, clearSavedData, navigate, queryClient]);

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