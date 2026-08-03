/**
 * Hook de carregamento de dados para RelatorioChecklist.
 * Busca checklist, obra, regional, projeto e usuários.
 */
import { useState, useEffect } from 'react';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { obterChecklistById } from '@/services/checklistsService';
import { carregarContextoRelatorio } from '@/services/relatorioContextService';
import { logger } from '@/utils/logger';

export function useRelatorioChecklistData() {
  const [checklist, setChecklist] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [creatorUser, setCreatorUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (!id) {
          setError('ID do checklist é obrigatório na URL');
          setLoading(false);
          return;
        }

        // Carrega checklist e usuário corrente em paralelo — ambos obrigatórios
        const [checklistData, userData] = await Promise.all([
          obterChecklistById('ChecklistUsina', id),
          obterUsuarioAtual().catch(() => null),
        ]);

        if (!checklistData) {
          setError(`Checklist com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setChecklist(checklistData);
        setUser(userData);

        // Renderiza imediatamente com dados denormalizados do registro.
        // Se a obra foi excluída, sintetiza um objeto fallback a partir dos
        // campos obra_name/obra_code salvos no momento da criação.
        if (checklistData.obra_name || checklistData.obra_code) {
          setObra(prev => prev || {
            id: checklistData.obra_id,
            name: checklistData.obra_name,
            code: checklistData.obra_code,
            regional_id: null,
          });
        }

        setLoading(false);

        // Contexto relacionado (obra → regional, project, criador) em paralelo.
        // Carregado em segundo plano — não bloqueia a renderização do relatório.
        // Se a obra foi excluída, carregarContextoRelatorio retorna nulls
        // e mantemos o objeto fallback sintetizado acima.
        carregarContextoRelatorio(checklistData)
          .then(ctx => {
            // Só sobrescreve se encontrou a obra real; caso contrário,
            // mantém o fallback denormalizado.
            if (ctx.obra) setObra(ctx.obra);
            setRegional(ctx.regional);
            setProject(ctx.project);
            setCreatorUser(ctx.creatorUser);
          })
          .catch(err => {
            logger.warn('[RelatorioChecklist] Contexto não carregado:', err);
          });
      } catch (err) {
        logger.error('[RelatorioChecklist] Erro ao carregar relatório:', err);
        setError(err.message || 'Erro ao carregar o checklist');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { checklist, obra, regional, project, user, creatorUser, loading, error };
}