import { useCallback } from 'react';

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

  /** Atualiza uma célula de ensaio de validação (array de objetos) */
  const handleEnsaioValidacaoChange = useCallback((ensaioKey, rowIndex, col, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const ensaios = newData.ensaios_validacao || {};
      if (!Array.isArray(ensaios[ensaioKey])) ensaios[ensaioKey] = [];
      while (ensaios[ensaioKey].length <= rowIndex) {
        ensaios[ensaioKey].push({ projeto: null, obtido: null, erro: null, desvio_padrao: null });
      }
      const parsed = value !== '' ? parseFloat(String(value).replace(',', '.')) : null;
      ensaios[ensaioKey][rowIndex] = { ...ensaios[ensaioKey][rowIndex], [col]: parsed };
      newData.ensaios_validacao = ensaios;
      return newData;
    });
  }, [setFormData]);

  /** Atualiza célula de granulometria (peneira fixa, só projeto/obtido/erro) */
  const handleGranulometriaChange = useCallback((rowIndex, col, value) => {
    setFormData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      const rows = newData.ensaios_validacao?.granulometria || [];
      while (rows.length <= rowIndex) rows.push({ peneira: '', projeto: null, obtido: null, erro: null });
      const parsed = value !== '' ? parseFloat(String(value).replace(',', '.')) : null;
      rows[rowIndex] = { ...rows[rowIndex], [col]: parsed };
      newData.ensaios_validacao = { ...(newData.ensaios_validacao || {}), granulometria: rows };
      return newData;
    });
  }, [setFormData]);

  return {
    handleChange,
    handleNestedChange,
    handleEnsaioValidacaoChange,
    handleGranulometriaChange,
  };
}