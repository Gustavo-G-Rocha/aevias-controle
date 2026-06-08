import { useCallback } from 'react';
import { calcularErro, calcularDesvioPadrao } from '@/utils/certificacaoUsinaUtils';
import { PENEIRAS_CONFIG } from '@/constants/sieves';

// Mapa inverso: chave do faixa_trabalho → label (ex: 'peneira_9_5mm' → '3/8"')
const KEY_TO_LABEL = Object.fromEntries(PENEIRAS_CONFIG.map((p) => [p.key, p.label]));

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

      // Granulometria: percorre TODAS as peneiras do projeto (faixa_trabalho) na ordem de PENEIRAS_CONFIG
      const ft = project.faixa_trabalho || {};
      const savedGran = Array.isArray(prev.ensaios_validacao?.granulometria)
        ? prev.ensaios_validacao.granulometria
        : [];
      // Constrói mapa peneira→obtido a partir dos dados salvos anteriormente
      const savedByLabel = Object.fromEntries(savedGran.map((r) => [r.peneira, r.obtido ?? null]));

      ev.granulometria = PENEIRAS_CONFIG
        .filter((p) => ft[p.key] != null)  // apenas peneiras que o projeto tem valor
        .map((p) => {
          const projetoVal = parseFloat(ft[p.key]);
          const obtido = savedByLabel[p.label] ?? null;
          return {
            peneira: p.label,
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