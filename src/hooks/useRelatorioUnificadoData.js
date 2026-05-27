/**
 * Hook de carregamento de dados para RelatorioUnificado.
 * Busca obra, regional, projetos e usuário atual.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Regional } from '@/entities/Regional';
import { Project } from '@/entities/Project';
import { User } from '@/entities/User';

export function useRelatorioUnificadoData() {
  const [obra, setObra] = useState(null);
  const [regional, setRegional] = useState(null);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const obra_id = params.get('obra_id');

        if (!obra_id) {
          setError('ID da obra é obrigatório na URL');
          setLoading(false);
          return;
        }

        const [obraData, regionaisData, projectsData, currentUser] = await Promise.all([
          base44.entities.Obra.get(obra_id),
          Regional.list(),
          Project.list(),
          User.me()
        ]);

        if (!obraData) {
          setError(`Obra com ID ${obra_id} não encontrada`);
          setLoading(false);
          return;
        }

        setObra(obraData);
        setUser(currentUser);
        setProjects(projectsData);

        const regionalData = regionaisData.find(r => r.id === obraData.regional_id);
        setRegional(regionalData);

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados do relatório unificado:', err);
        setError(err.message || 'Erro ao carregar dados');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { obra, regional, projects, user, loading, error };
}