import { useCallback } from 'react';
import { calcularErro, calcularDesvioPadrao } from '@/utils/certificacaoUsinaUtils';
import { PENEIRAS_CONFIG } from '@/constants/sieves';

export function buildPedreiraDoProjeto(project) {
  if (!project?.agregados || !Array.isArray(project.agregados)) return '';
  return [...new Set(project.agregados.map(ag => ag.pedreira).filter(Boolean))].join(' + ');
}

function recalcularErroeDP(rows, hasDP = true) {
  const comErro = rows.map((r) => ({
    ...r,
    erro: calcularErro(r.projeto, r.obtido),
  }));
  if (!hasDP) return comErro;
  const obtidos = comErro.map((r) => r.obtido);
  const dp = calcularDesvioPadrao(obtidos);
  return comErro.map((r) => ({ ...r, desvio_padrao: dp }));
}

/**
 * Hook com handlers para o formulário de Certificação de Usinas.
 */
export function useCertificacaoUsinaForm({ setFormData, projects = [], faixas = [] }) {

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [setFormData]);

  /** Ao trocar obra, limpa project_id e campos derivados */
  const handleObraChange = useCallback((obraId) => {
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      project_id: '',
      pedreira: '',
      faixa_especificada: '',
      ligante: '',
    }));
  }, [setFormData]);

  /** Ao trocar projeto, preenche pedreira, faixa e ligante automaticamente */
  const handleProjectChange = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      setFormData(prev => ({ ...prev, project_id: '' }));
      return;
    }
    const faixa = faixas.find(f => f.id === project.faixa_granulometrica_id);
    const pedreira = buildPedreiraDoProjeto(project);
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      pedreira,
      faixa_especificada: faixa ? faixa.nome : (prev.faixa_especificada || ''),
      ligante: project.ligante?.tipo || prev.ligante || '',
    }));
  }, [projects, faixas, setFormData]);

  /** Atualiza campo aninhado: path = "saude_seguranca.treinamentos.nr10_eletricistas" */
  const handleNestedChange = useCallback((path, value) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const newData = JSON.parse(JSON.stringify(prev));
      let cursor = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!cursor[keys[i]] || typeof cursor[keys[i]] !== 'object') {
          cursor[keys[i]] = {};
        }
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return newData;
    });
  }, [setFormData]);

  /** Atualiza uma célula de ensaio de validação (array de objetos); recalcula erro e DP automaticamente */
  const handleEnsaioValidacaoChange = useCallback((ensaioKey, rowIndex, col, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const ensaios = newData.ensaios_validacao || {};
      // Garante sempre 4 linhas fixas
      if (!Array.isArray(ensaios[ensaioKey]) || ensaios[ensaioKey].length < 4) {
        const existing = Array.isArray(ensaios[ensaioKey]) ? ensaios[ensaioKey] : [];
        ensaios[ensaioKey] = Array.from({ length: 4 }, (_, i) =>
          existing[i] || { projeto: null, obtido: null, erro: null, desvio_padrao: null }
        );
      }
      const str = String(value ?? '').replace(',', '.').trim();
      const n = str !== '' ? parseFloat(str) : null;
      ensaios[ensaioKey][rowIndex] = { ...ensaios[ensaioKey][rowIndex], [col]: (n !== null && isNaN(n)) ? null : n };
      // Recalcula erro e desvio padrão automaticamente
      ensaios[ensaioKey] = recalcularErroeDP(ensaios[ensaioKey]);
      newData.ensaios_validacao = ensaios;
      return newData;
    });
  }, [setFormData]);

  /** Atualiza célula de granulometria; recalcula erro automaticamente */
  const handleGranulometriaChange = useCallback((rowIndex, col, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      // Preserva as linhas dinâmicas salvas no estado
      let rows = Array.isArray(newData.ensaios_validacao?.granulometria)
        ? [...newData.ensaios_validacao.granulometria]
        : [];
      const str = String(value ?? '').replace(',', '.').trim();
      const n = str !== '' ? parseFloat(str) : null;
      if (rows[rowIndex]) {
        rows[rowIndex] = { ...rows[rowIndex], [col]: (n !== null && isNaN(n)) ? null : n };
      }
      // Recalcula erro (sem DP para granulometria)
      rows = recalcularErroeDP(rows, false);
      newData.ensaios_validacao = { ...(newData.ensaios_validacao || {}), granulometria: rows };
      return newData;
    });
  }, [setFormData]);

  /** Preenche valores de projeto automaticamente a partir do projeto selecionado */
  const handlePreencherProjeto = useCallback((project) => {
    if (!project) return;
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const ev = newData.ensaios_validacao || {};

      // Helper para preencher array de 4 linhas com valor de projeto único
      const fillRows = (key, projetoVal) => {
        const existing = Array.isArray(ev[key]) ? ev[key] : [];
        ev[key] = Array.from({ length: 4 }, (_, i) => ({
          ...(existing[i] || { obtido: null }),
          projeto: projetoVal ?? null,
          erro: calcularErro(projetoVal, existing[i]?.obtido),
          desvio_padrao: null,
        }));
        // Recalcula DP após preencher todos
        ev[key] = recalcularErroeDP(ev[key]);
      };

      // Teor de ligante
      fillRows('teor_ligante_rotarex', project.teor_ligante?.otimo ?? null);
      // Volume de vazios
      fillRows('volume_vazios', project.volume_vazios?.otimo ?? null);
      // Densidade RICE
      fillRows('densidade_rice', project.densidade_maxima_medida ?? null);
      // Densidade aparente
      fillRows('densidade_aparente', project.massa_especifica_aparente ?? null);
      // Relação fíler/betume: campo dedicado no projeto
      fillRows('relacao_filer_betume', project.relacao_filer_betume ?? null);

      // Granulometria: usa TODAS as peneiras de PENEIRAS_CONFIG que o projeto tem valor em faixa_trabalho
      const ft = project.faixa_trabalho || {};
      const prevGran = Array.isArray(prev.ensaios_validacao?.granulometria)
        ? prev.ensaios_validacao.granulometria
        : [];
      ev.granulometria = PENEIRAS_CONFIG
        .filter(({ key }) => ft[key] != null)
        .map(({ key, label }) => {
          const projetoVal = parseFloat(ft[key]);
          // preserva "obtido" já digitado pelo usuário (busca por label)
          const prevRow = prevGran.find((r) => r.peneira === label) || {};
          const obtido = prevRow.obtido ?? null;
          return {
            peneira: label,
            projeto: isNaN(projetoVal) ? null : projetoVal,
            obtido,
            erro: calcularErro(projetoVal, obtido),
          };
        });

      newData.ensaios_validacao = ev;
      return newData;
    });
  }, [setFormData]);

  return {
    handleChange,
    handleObraChange,
    handleProjectChange,
    handleNestedChange,
    handleEnsaioValidacaoChange,
    handleGranulometriaChange,
    handlePreencherProjeto,
  };
}