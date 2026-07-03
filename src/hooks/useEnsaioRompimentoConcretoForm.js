/**
 * Hook de mutações do formulário EnsaioRompimentoConcreto.
 */
import { useCallback, useEffect } from 'react';
import { obterRegionalById } from '@/services/regionaisService';
import {
  calcularAreaCP,
  calcularResistencia,
  calcularResistenciaFlexaoCp,
  calcularDataRuptura,
  novaSerie,
  novaSerieFlexao,
  seriesToCompressaoAxial,
  seriesToTracaoFlexao,
} from '@/utils/ensaioRompimentoConcretoUtils';

export function useEnsaioRompimentoConcretoForm({ formData, setFormData, series, setSeries, seriesFlexao, setSeriesFlexao }) {

  // ── Sync series → formData ──
  useEffect(() => {
    setFormData(prev => ({ ...prev, compressao_axial: seriesToCompressaoAxial(series) }));
  }, [series]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, tracao_flexao: seriesToTracaoFlexao(seriesFlexao) }));
  }, [seriesFlexao]);

  // ── Generic field ──
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  // ── Obra change ──
  const handleObraChange = useCallback(async (obraId, obras) => {
    const obra = obras.find(o => o.id === obraId);
    let clienteNome = '';
    if (obra?.regional_id) {
      try {
        const reg = await obterRegionalById(obra.regional_id);
        clienteNome = reg?.cliente || '';
      } catch (e) {
        console.error('Erro ao carregar cliente da regional', e);
      }
    }
    setFormData(prev => ({
      ...prev,
      obra_id: obraId,
      rodovia: '',
      fornecedor: '',
      project_id: '',
      cliente: clienteNome,
      construtora: obra?.tipo_obra !== 'supervisao' ? clienteNome : '',
    }));
  }, [setFormData]);

  // ── Compressão Axial ──
  const addSerie = useCallback(() => {
    setSeries(prev => prev.length < 4 ? [...prev, novaSerie()] : prev);
  }, [setSeries]);

  const removeSerie = useCallback((idx) => {
    setSeries(prev => prev.filter((_, i) => i !== idx));
  }, [setSeries]);

  const updateSerie = useCallback((serieIdx, field, value) => {
    setSeries(prev => prev.map((s, i) => {
      if (i !== serieIdx) return s;
      const updated = { ...s, [field]: value };
      if (field === 'dimensao') {
        updated.area_cp = calcularAreaCP(value);
        updated.cps = updated.cps.map(cp => ({
          ...cp,
          resistencia: cp.carga_ruptura ? calcularResistencia(cp.carga_ruptura, updated.area_cp) : '',
        }));
      }
      if (field === 'idade') {
        updated.data_ruptura = calcularDataRuptura(formData.data_ensaio, value);
      }
      return updated;
    }));
  }, [setSeries, formData.data_ensaio]);

  const updateSerieCP = useCallback((serieIdx, cpIdx, field, value) => {
    setSeries(prev => prev.map((s, i) => {
      if (i !== serieIdx) return s;
      const novasCps = s.cps.map((cp, j) => {
        if (j !== cpIdx) return cp;
        const updated = { ...cp, [field]: value };
        if (field === 'carga_ruptura') updated.resistencia = calcularResistencia(value, s.area_cp);
        return updated;
      });
      return { ...s, cps: novasCps };
    }));
  }, [setSeries]);

  // ── Tração na Flexão ──
  const addSerieFlexao = useCallback(() => {
    setSeriesFlexao(prev => prev.length < 2 ? [...prev, novaSerieFlexao()] : prev);
  }, [setSeriesFlexao]);

  const removeSerieFlexao = useCallback((idx) => {
    setSeriesFlexao(prev => prev.filter((_, i) => i !== idx));
  }, [setSeriesFlexao]);

  const updateSerieFlexao = useCallback((serieIdx, field, value) => {
    setSeriesFlexao(prev => prev.map((s, i) => {
      if (i !== serieIdx) return s;
      const updated = { ...s, [field]: value };
      if (field === 'idade') updated.data_ruptura = calcularDataRuptura(formData.data_ensaio, value);
      updated.cps = updated.cps.map(cp => ({ ...cp, resistencia: calcularResistenciaFlexaoCp(cp, updated) }));
      return updated;
    }));
  }, [setSeriesFlexao, formData.data_ensaio]);

  const updateSerieFlexaoCP = useCallback((serieIdx, cpIdx, field, value) => {
    setSeriesFlexao(prev => prev.map((s, i) => {
      if (i !== serieIdx) return s;
      const novasCps = s.cps.map((cp, j) => {
        if (j !== cpIdx) return cp;
        const updated = { ...cp, [field]: value };
        updated.resistencia = calcularResistenciaFlexaoCp(updated, s);
        return updated;
      });
      return { ...s, cps: novasCps };
    }));
  }, [setSeriesFlexao]);

  return {
    handleInputChange, handleObraChange,
    addSerie, removeSerie, updateSerie, updateSerieCP,
    addSerieFlexao, removeSerieFlexao, updateSerieFlexao, updateSerieFlexaoCP,
  };
}