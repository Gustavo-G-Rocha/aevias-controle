/**
 * Hook de carregamento inicial para EnsaioRompimentoConcreto.
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
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
  const [obras,         setObras]         = useState([]);
  const [projects,      setProjects]      = useState([]);
  const [formData,      setFormData]      = useState(FORM_INITIAL);
  const [series,        setSeries]        = useState([]);
  const [seriesFlexao,  setSeriesFlexao]  = useState([]);

  // ── Initial load ──
  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        const [obrasData, projectsData, regionaisData] = await Promise.all([
          base44.entities.Obra.list(),
          base44.entities.Project.list(),
          base44.entities.Regional.list(),
        ]);

        const obrasFiltradas  = filtrarObras(obrasData, user, regionaisData);
        const projetosConcreto = projectsData.filter(p => p.tipo_projeto === 'CARTA_TRACO_CONCRETO');

        setObras(obrasFiltradas);
        setProjects(projetosConcreto);

        if (editId) {
          const ensaio = await base44.entities.EnsaioRompimentoConcreto.get(editId);
          setFormData({ ...ensaio, compressao_axial: ensaio.compressao_axial || [], tracao_flexao: ensaio.tracao_flexao || [] });
        } else {
          setFormData(prev => ({ ...prev, laboratorista_name: user.laboratorista_name || user.full_name }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [editId]);

  // ── Reconstruct series from formData when editing ──
  useEffect(() => {
    if (formData.compressao_axial?.length > 0 && series.length === 0) {
      setSeries(compressaoAxialToSeries(formData.compressao_axial));
    }
  }, [formData.compressao_axial.length]);

  useEffect(() => {
    if (formData.tracao_flexao?.length > 0 && seriesFlexao.length === 0) {
      setSeriesFlexao(tracaoFlexaoToSeries(formData.tracao_flexao));
    }
  }, [formData.tracao_flexao.length]);

  return {
    editId, loading,
    obras, projects,
    formData, setFormData,
    series, setSeries,
    seriesFlexao, setSeriesFlexao,
  };
}