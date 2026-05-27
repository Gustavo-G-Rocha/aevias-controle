/**
 * Hook de carregamento de dados para RelatorioChecklistConcretagem.
 * Busca checklist concretagem e usuário criador.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useRelatorioChecklistConcretagemData() {
  const [checklist, setChecklist] = useState(null);
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

        const checklistData = await base44.entities.ChecklistConcretagem.get(id);

        if (!checklistData) {
          setError(`Checklist com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setChecklist(checklistData);

        // Busca criador do checklist
        if (checklistData.created_by) {
          try {
            const users = await base44.entities.User.filter({ email: checklistData.created_by });
            if (users && users.length > 0) {
              setCreatorUser(users[0]);
            }
          } catch (err) {
            console.warn("Não foi possível buscar dados do criador:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar relatório do checklist concretagem:', err);
        setError(err.message || 'Erro ao carregar o checklist');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { checklist, creatorUser, loading, error };
}