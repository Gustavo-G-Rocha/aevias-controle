/**
 * Hook de carregamento de dados para RelatorioChecklistConcretagem.
 * Busca checklist, usuário criador, obra, regional e projeto.
 * Falhas parciais em dados relacionados não quebram o relatório.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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

        const checklistData = await base44.entities.ChecklistConcretagem.get(id);

        if (!checklistData) {
          setError(`Checklist com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setChecklist(checklistData);

        // Busca dados relacionados em paralelo — falha isolada não quebra o relatório
        await Promise.allSettled([
          // Criador
          checklistData.created_by
            ? base44.entities.User.filter({ email: checklistData.created_by })
                .then(users => { if (users?.length > 0) setCreatorUser(users[0]); })
                .catch(err => console.warn('[Concretagem] Criador não carregado:', err))
            : Promise.resolve(),

          // Obra → Regional (sequencial pois regional depende de obra)
          checklistData.obra_id
            ? base44.entities.Obra.get(checklistData.obra_id)
                .then(obraData => {
                  setObra(obraData);
                  if (obraData?.regional_id) {
                    return base44.entities.Regional.get(obraData.regional_id)
                      .then(reg => setRegional(reg))
                      .catch(err => console.warn('[Concretagem] Regional não carregada:', err));
                  }
                })
                .catch(err => console.warn('[Concretagem] Obra não carregada:', err))
            : Promise.resolve(),

          // Projeto
          checklistData.project_id
            ? base44.entities.Project.get(checklistData.project_id)
                .then(proj => setProject(proj))
                .catch(err => console.warn('[Concretagem] Projeto não carregado:', err))
            : Promise.resolve(),
        ]);

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