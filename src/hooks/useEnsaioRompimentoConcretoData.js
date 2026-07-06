/**
 * Hook de carregamento inicial para EnsaioRompimentoConcreto.
 * Usa React Query (cache compartilhado via useAuxData) para evitar chamadas redundantes.
 */
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obterEnsaioById } from '@/services/ensaiosService';
import { useCurrentUser, useAuxData } from '@/hooks/useQueryData';
import { logger } from '@/utils/logger';
import {
  FORM_INITIAL,
  filtrarObras,
  compressaoAxialToSeries,
  tracaoFlexaoToSeries,
} from '@/utils/ensaioRompimentoConcretoUtils';

export function useEnsaioRompimentoConcretoData() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const [loading,       setLoading]       = useState(true);
  const [formData,      setFormData]      = useState(FORM_INITIAL);
  const [series,        setSeries]        = useState([]);
  const [seriesFlexao,  setSeriesFlexao]  = useState([]);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    return filtrarObras(auxData.obras, user, auxData.regionais);
  }, [auxData, user]);

  const projects = useMemo(() => {
    if (!auxData?.projects) return [];
    return auxData.projects.filter(p => p.tipo_projeto === 'CARTA_TRACO_CONCRETO');
  }, [auxData?.projects]);

  // ── Edit load ──
  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    if (editId) {
      obterEnsaioById('EnsaioRompimentoConcreto', editId)
        .then(ensaio => {
          setFormData({ ...ensaio, compressao_axial: ensaio.compressao_axial || [], tracao_flexao: ensaio.tracao_flexao || [] });
        })
        .catch(error => logger.error('Erro ao carregar dados:', error))
        .finally(() => setLoading(false));
    } else {
      setFormData(prev => ({ ...prev, laboratorista_name: user.laboratorista_name || user.full_name }));
      setLoading(false);
    }
  }, [editId, loadingUser, loadingAux, user?.id]);

  // ── Reconstruct series from formData when editing ──
  useEffect(() => {
    if (formData.compressao_axial?.length > 0 && series.length === 0) {
      setSeries(compressaoAxialToSeries(formData.compressao_axial));
    }
  }, [formData.compressao_axial.length, series.length]);

  useEffect(() => {
    if (formData.tracao_flexao?.length > 0 && seriesFlexao.length === 0) {
      setSeriesFlexao(tracaoFlexaoToSeries(formData.tracao_flexao));
    }
  }, [formData.tracao_flexao.length, seriesFlexao.length]);

  return {
    editId, loading,
    obras, projects,
    formData, setFormData,
    series, setSeries,
    seriesFlexao, setSeriesFlexao,
  };
}