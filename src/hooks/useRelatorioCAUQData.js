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
        if (!ensaioData) { setError('Ensaio não encontrado'); return; }
        setEnsaio(ensaioData);

        // Dados relacionados em paralelo — falha isolada não quebra o relatório
        await Promise.allSettled([
          ensaioData.obra_id
            ? base44.entities.Obra.get(ensaioData.obra_id)
                .then(obraData => {
                  setObra(obraData);
                  if (obraData?.regional_id) {
                    return base44.entities.Regional.get(obraData.regional_id)
                      .then(r => setRegional(r))
                      .catch(e => console.warn('[RelatorioCAUQ] Regional não carregada:', e));
                  }
                })
                .catch(e => console.warn('[RelatorioCAUQ] Obra não carregada:', e))
            : Promise.resolve(),

          ensaioData.project_id
            ? base44.entities.Project.get(ensaioData.project_id)
                .then(projectData => {
                  setProject(projectData);
                  if (projectData?.faixa_granulometrica_id) {
                    return base44.entities.FaixaGranulometrica.get(projectData.faixa_granulometrica_id)
                      .then(f => setFaixa(f))
                      .catch(e => console.warn('[RelatorioCAUQ] Faixa não carregada:', e));
                  }
                })
                .catch(e => console.warn('[RelatorioCAUQ] Projeto não carregado:', e))
            : Promise.resolve(),
        ]);
      } catch (err) {
        console.error('[RelatorioCAUQ] Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do relatório');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { ensaio, obra, regional, project, faixa, loading, error };
}