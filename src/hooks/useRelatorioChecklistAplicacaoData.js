/**
 * Hook de carregamento de dados para RelatorioChecklistAplicacao.
 * Busca checklist aplicação, obra, regional, projeto e usuários.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useRelatorioChecklistAplicacaoData() {
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

        // Checklist e usuário em paralelo — checklist é obrigatório
        const [checklistData, userData] = await Promise.all([
          base44.entities.ChecklistAplicacao.get(id),
          base44.auth.me().catch(() => null),
        ]);

        if (!checklistData) {
          setError(`Checklist com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setChecklist(checklistData);
        setUser(userData);

        // Dados relacionados em paralelo — falha isolada não quebra o relatório
        await Promise.allSettled([
          // Obra → Regional (sequencial)
          checklistData.obra_id
            ? base44.entities.Obra.get(checklistData.obra_id)
                .then(obraData => {
                  setObra(obraData);
                  if (obraData?.regional_id) {
                    return base44.entities.Regional.get(obraData.regional_id)
                      .then(reg => setRegional(reg))
                      .catch(err => console.warn('[ChecklistAplicacao] Regional não carregada:', err));
                  }
                })
                .catch(err => console.warn('[ChecklistAplicacao] Obra não carregada:', err))
            : Promise.resolve(),

          // Projeto
          checklistData.project_id
            ? base44.entities.Project.get(checklistData.project_id)
                .then(proj => setProject(proj))
                .catch(err => console.warn('[ChecklistAplicacao] Projeto não carregado:', err))
            : Promise.resolve(),

          // Criador — filtro direto, sem carregar toda a lista
          checklistData.created_by
            ? base44.entities.User.filter({ email: checklistData.created_by })
                .then(users => { if (users?.length > 0) setCreatorUser(users[0]); })
                .catch(err => console.warn('[ChecklistAplicacao] Criador não carregado:', err))
            : Promise.resolve(),
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar relatório do checklist aplicação:', err);
        setError(err.message || 'Erro ao carregar o checklist');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { checklist, obra, regional, project, user, creatorUser, loading, error };
}