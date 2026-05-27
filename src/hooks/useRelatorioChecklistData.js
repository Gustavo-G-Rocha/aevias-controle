/**
 * Hook de carregamento de dados para RelatorioChecklist.
 * Busca checklist, obra, regional, projeto e usuários.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ChecklistUsina } from '@/entities/ChecklistUsina';
import { Obra } from '@/entities/Obra';
import { Regional } from '@/entities/Regional';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';

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

        // Carrega dados em paralelo
        const [checklistData, userData, obrasList, regionaisList, projectsList] = await Promise.all([
          ChecklistUsina.get(id),
          User.me(),
          Obra.list(),
          Regional.list(),
          Project.list(),
        ]);

        if (!checklistData) {
          setError(`Checklist com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setChecklist(checklistData);
        setUser(userData);

        // Encontra obra e regional
        if (checklistData.obra_id) {
          const obraData = obrasList.find((o) => o.id === checklistData.obra_id);
          setObra(obraData);

          if (obraData && obraData.regional_id) {
            const regionalData = regionaisList.find((r) => r.id === obraData.regional_id);
            setRegional(regionalData);
          }
        }

        // Encontra projeto
        if (checklistData.project_id) {
          const projectData = projectsList.find((p) => p.id === checklistData.project_id);
          setProject(projectData);
        }

        // Busca criador do checklist
        if (checklistData.created_by) {
          try {
            const allUsers = await base44.entities.User.list();
            const creator = allUsers.find(
              (u) => u.email?.toLowerCase() === checklistData.created_by?.toLowerCase()
            ) || null;
            setCreatorUser(creator);
          } catch (err) {
            console.warn("Não foi possível buscar dados do criador:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar relatório do checklist:', err);
        setError(err.message || 'Erro ao carregar o checklist');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { checklist, obra, regional, project, user, creatorUser, loading, error };
}