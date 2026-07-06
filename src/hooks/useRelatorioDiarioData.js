/**
 * Hook de carregamento de dados para RelatorioDiario.
 * Busca diário, obra, usuário, projeto e regional.
 */
import { useState, useEffect } from 'react';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { obterDiarioById } from '@/services/diarioObraService';
import { logger } from '@/utils/logger';
import {
  carregarContextoRelatorio,
  carregarProject,
} from '@/services/relatorioContextService';

export function useRelatorioDiarioData() {
  const [diario, setDiario] = useState(null);
  const [obra, setObra] = useState(null);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [regional, setRegional] = useState(null);
  const [creatorUser, setCreatorUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
          setError('ID do diário é obrigatório na URL');
          setLoading(false);
          return;
        }

        // Diário e usuário em paralelo — diário é obrigatório
        const [diarioData, userData] = await Promise.all([
          obterDiarioById(id),
          obterUsuarioAtual().catch(() => null),
        ]);

        if (!diarioData) {
          setError(`Diário com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setDiario(diarioData);
        setUser(userData);

        // Contexto: obra→regional, project (pode vir da obra em alguns fluxos), criador
        const ctx = await carregarContextoRelatorio(diarioData);
        setObra(ctx.obra);
        setRegional(ctx.regional);
        setCreatorUser(ctx.creatorUser);

        // Projeto pode estar no diário (project_id) ou na obra
        const projectId = diarioData.project_id || ctx.obra?.project_id;
        setProject(projectId ? await carregarProject(projectId) : null);

        setLoading(false);
      } catch (err) {
        logger.error('[RelatorioDiario] Erro ao carregar relatório:', err);
        setError('Erro ao carregar o diário');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { diario, obra, project, user, regional, creatorUser, loading, error };
}