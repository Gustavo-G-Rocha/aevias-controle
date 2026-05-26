/**
 * Hook de carregamento de dados para RelatorioCAUQ.
 * Busca ensaio, obra, regional, projeto e faixa granulométrica.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useRelatorioCAUQData() {
  const [ensaio,   setEnsaio]   = useState(null);
  const [obra,     setObra]     = useState(null);
  const [regional, setRegional] = useState(null);
  const [project,  setProject]  = useState(null);
  const [faixa,    setFaixa]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const params   = new URLSearchParams(window.location.search);
        const ensaioId = params.get('id');

        if (!ensaioId) {
          setError('ID do ensaio não fornecido');
          return;
        }

        const ensaioData = await base44.entities.EnsaioCAUQ.get(ensaioId);
        setEnsaio(ensaioData);

        if (ensaioData.obra_id) {
          const obraData = await base44.entities.Obra.get(ensaioData.obra_id);
          setObra(obraData);

          if (obraData.regional_id) {
            const regionalData = await base44.entities.Regional.get(obraData.regional_id);
            setRegional(regionalData);
          }
        }

        if (ensaioData.project_id) {
          const projectData = await base44.entities.Project.get(ensaioData.project_id);
          setProject(projectData);

          if (projectData.faixa_granulometrica_id) {
            const faixaData = await base44.entities.FaixaGranulometrica.get(projectData.faixa_granulometrica_id);
            setFaixa(faixaData);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do relatório');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { ensaio, obra, regional, project, faixa, loading, error };
}