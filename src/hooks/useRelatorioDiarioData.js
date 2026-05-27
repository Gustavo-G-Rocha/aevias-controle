/**
 * Hook de carregamento de dados para RelatorioDiario.
 * Busca diário, obra, usuário, projeto e regional.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DiarioObra } from '@/entities/DiarioObra';
import { Obra } from '@/entities/Obra';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';

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

        // Verificar autenticação
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setError('Você precisa estar autenticado para visualizar este relatório');
          setLoading(false);
          return;
        }

        // Carrega diário
        const diarioData = await DiarioObra.get(id);
        if (!diarioData) {
          setError(`Diário com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }
        setDiario(diarioData);

        // Carrega usuário atual
        const userData = await User.me();
        setUser(userData);

        // Carrega criador do diário
        if (diarioData.created_by) {
          try {
            const allUsers = await base44.entities.User.list();
            const creator = allUsers.find(
              (u) => u.email?.toLowerCase() === diarioData.created_by?.toLowerCase()
            ) || null;
            setCreatorUser(creator);
          } catch (err) {
            console.warn("Não foi possível buscar dados do criador:", err);
          }
        }

        // Carrega obra, projeto e regional
        if (diarioData.obra_id) {
          try {
            const obraData = await Obra.get(diarioData.obra_id);
            setObra(obraData);

            if (obraData.project_id) {
              try {
                const projectData = await Project.get(obraData.project_id);
                setProject(projectData);
              } catch (err) {
                console.warn("Projeto não encontrado:", obraData.project_id);
              }
            }

            if (obraData.regional_id) {
              try {
                const regionalData = await base44.entities.Regional.get(obraData.regional_id);
                setRegional(regionalData);
              } catch (err) {
                console.warn("Regional não encontrada:", obraData.regional_id);
              }
            }
          } catch (err) {
            console.warn("Obra não encontrada:", diarioData.obra_id);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar relatório do diário:', err);
        setError('Erro ao carregar o diário');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { diario, obra, project, user, regional, creatorUser, loading, error };
}