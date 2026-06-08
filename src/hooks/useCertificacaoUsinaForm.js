import { useCallback } from 'react';
import { calcularErro, calcularDesvioPadrao, PENEIRAS_GRANULOMETRIA } from '@/utils/certificacaoUsinaUtils';

// Mapeamento de peneira para chave no faixa_trabalho do projeto
const PENEIRA_KEY_MAP = {
  '1 1/2"': 'peneira_37_5mm',
  '1"':     'peneira_25_0mm',
  '3/4"':   'peneira_19_0mm',
  '1/2"':   'peneira_12_5mm',
  '3/8"':   'peneira_9_5mm',
  '#4':     'peneira_4_75mm',
  '#10':    'peneira_2_36mm',
  '#40':    'peneira_0_42mm',
  '#80':    'peneira_0_18mm',
  '#200':   'peneira_0_075mm',
};

function recalcularErroeDP(rows, hasDP = true) {
  const comErro = rows.map((r) => ({
    ...r,
    erro: calcularErro(r.projeto, r.obtido),
  }));
  if (!hasDP) return comErro;
  const erros = comErro.map((r) => r.erro);
  const dp = calcularDesvioPadrao(erros);
  return comErro.map((r) => ({ ...r, desvio_padrao: dp }));
}

/**
 * Hook com handlers para o formulário de Certificação de Usinas.
 */
export function useCertificacaoUsinaForm({ setFormData }) {

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [setFormData]);

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
      let rows = PENEIRAS_GRANULOMETRIA.map((p, i) => {
        const saved = newData.ensaios_validacao?.granulometria?.[i] || {};
        return { peneira: p, projeto: saved.projeto ?? null, obtido: saved.obtido ?? null, erro: saved.erro ?? null };
      });
      const str = String(value ?? '').replace(',', '.').trim();
      const n = str !== '' ? parseFloat(str) : null;
      rows[rowIndex] = { ...rows[rowIndex], [col]: (n !== null && isNaN(n)) ? null : n };
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
      // Relação fíler/betume: usa rbv.otimo como proxy (ou null)
      fillRows('relacao_filer_betume', project.rbv?.otimo ?? null);

      // Granulometria: preenche cada peneira com valor da faixa_trabalho do projeto
      const ft = project.faixa_trabalho || {};
      ev.granulometria = PENEIRAS_GRANULOMETRIA.map((p, i) => {
        const key = PENEIRA_KEY_MAP[p];
        const projetoVal = (key && ft[key] != null) ? parseFloat(ft[key]) : null;
        const saved = (Array.isArray(prev.ensaios_validacao?.granulometria) ? prev.ensaios_validacao.granulometria[i] : null) || {};
        const obtido = saved.obtido ?? null;
        return {
          peneira: p,
          projeto: projetoVal,
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
    handleNestedChange,
    handleEnsaioValidacaoChange,
    handleGranulometriaChange,
    handlePreencherProjeto,
  };
}