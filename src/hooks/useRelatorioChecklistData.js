/**
 * Hook de carregamento de dados para RelatorioChecklist.
 * Busca checklist, obra, regional, projeto e usuários.
 */
import { useState, useEffect } from 'react';
import { obterUsuarioAtual } from '@/services/usuariosService';
import { obterChecklistById } from '@/services/checklistsService';
import { carregarContextoRelatorio } from '@/services/relatorioContextService';

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

        // Contexto relacionado (obra → regional, project, criador) em paralelo
        const ctx = await carregarContextoRelatorio(checklistData);
        setObra(ctx.obra);
        setRegional(ctx.regional);
        setProject(ctx.project);
        setCreatorUser(ctx.creatorUser);

        setLoading(false);
      } catch (err) {
        console.error('[RelatorioChecklist] Erro ao carregar relatório:', err);
        setError(err.message || 'Erro ao carregar o checklist');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { checklist, obra, regional, project, user, creatorUser, loading, error };
}