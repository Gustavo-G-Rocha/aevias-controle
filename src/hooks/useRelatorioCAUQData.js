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
        if (!ensaioData) { setError('Ensaio não encontrado'); return; }
        setEnsaio(ensaioData);

        // Dados relacionados em paralelo — falha isolada não quebra o relatório
        const [obraRegional, projectData] = await Promise.all([
          carregarObraRegional(ensaioData.obra_id),
          carregarProject(ensaioData.project_id),
        ]);

        setObra(obraRegional.obra);
        setRegional(obraRegional.regional);
        setProject(projectData);

        if (projectData) {
          const faixaData = await carregarFaixaDoProject(projectData);
          setFaixa(faixaData);
        }
      } catch (err) {
        logger.error('[RelatorioCAUQ] Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do relatório');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { ensaio, obra, regional, project, faixa, loading, error };
}