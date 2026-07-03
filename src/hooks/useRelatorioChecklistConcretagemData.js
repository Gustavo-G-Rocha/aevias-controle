/**
 * Hook de carregamento de dados para RelatorioChecklistConcretagem.
 * Busca checklist, usuário criador, obra, regional e projeto.
 * Falhas parciais em dados relacionados não quebram o relatório.
 */
import { useState, useEffect } from 'react';
import { obterChecklistById } from '@/services/checklistsService';
import { carregarContextoRelatorio } from '@/services/relatorioContextService';

export function useRelatorioChecklistConcretagemData() {
  const [checklist, setChecklist] = useState(null);
  const [creatorUser, setCreatorUser] = useState(null);
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [project, setProject] = useState(null);
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

        const checklistData = await obterChecklistById('ChecklistConcretagem', id);

        if (!checklistData) {
          setError(`Checklist com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setChecklist(checklistData);

        // Contexto completo (obra, regional, project, creatorUser) em paralelo
        const ctx = await carregarContextoRelatorio(checklistData);
        setObra(ctx.obra);
        setRegional(ctx.regional);
        setProject(ctx.project);
        setCreatorUser(ctx.creatorUser);
      } catch (err) {
        console.error('[Concretagem] Erro ao carregar relatório:', err);
        setError(err.message || 'Erro ao carregar o checklist');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { checklist, creatorUser, obra, regional, project, loading, error };
}