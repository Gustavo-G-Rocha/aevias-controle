/**
 * Hook de carregamento de dados para RelatorioCAUQ.
 * Busca ensaio, obra, regional, projeto e faixa granulométrica.
 */
import { useState, useEffect } from 'react';
import { obterEnsaioById } from '@/services/ensaiosService';
import { logger } from '@/utils/logger';
import {
  carregarObraRegional,
  carregarProject,
  carregarFaixaDoProject,
} from '@/services/relatorioContextService';

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

        const ensaioData = await obterEnsaioById('EnsaioCAUQ', ensaioId);
        if (!ensaioData) { setError('Ensaio não encontrado'); setLoading(false); return; }

        setEnsaio(ensaioData);

        // Renderiza imediatamente com os dados do ensaio.
        // Dados relacionados carregam em segundo plano — não bloqueiam.
        setLoading(false);

        // Contexto relacionado (obra → regional, project, faixa) em paralelo.
        // Falha isolada não quebra o relatório — o ensaio já está renderizado.
        Promise.all([
          carregarObraRegional(ensaioData.obra_id),
          carregarProject(ensaioData.project_id),
        ]).then(([obraRegional, projectData]) => {
          setObra(obraRegional.obra);
          setRegional(obraRegional.regional);
          setProject(projectData);
          if (projectData) {
            carregarFaixaDoProject(projectData).then(setFaixa).catch(() => {});
          }
        }).catch(err => {
          logger.warn('[RelatorioCAUQ] Contexto não carregado:', err);
        });
      } catch (err) {
        logger.error('[RelatorioCAUQ] Erro ao carregar ensaio:', err);
        setError(err.message || 'Erro ao carregar ensaio');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { ensaio, obra, regional, project, faixa, loading, error };
}