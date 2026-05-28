/**
 * Hook de carregamento de dados para RelatorioDiario.
 * Busca diário, obra, usuário, projeto e regional.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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
          base44.entities.DiarioObra.get(id),
          base44.auth.me().catch(() => null),
        ]);

        if (!diarioData) {
          setError(`Diário com ID ${id} não encontrado`);
          setLoading(false);
          return;
        }

        setDiario(diarioData);
        setUser(userData);

        // Dados relacionados em paralelo — falha isolada não quebra o relatório
        await Promise.allSettled([
          // Obra → Projeto e Regional (sequencial pois dependem de obra)
          diarioData.obra_id
            ? base44.entities.Obra.get(diarioData.obra_id)
                .then(obraData => {
                  setObra(obraData);
                  return Promise.allSettled([
                    obraData?.project_id
                      ? base44.entities.Project.get(obraData.project_id)
                          .then(p => setProject(p))
                          .catch(err => console.warn('[RelatorioDiario] Projeto não carregado:', err))
                      : Promise.resolve(),
                    obraData?.regional_id
                      ? base44.entities.Regional.get(obraData.regional_id)
                          .then(r => setRegional(r))
                          .catch(err => console.warn('[RelatorioDiario] Regional não carregada:', err))
                      : Promise.resolve(),
                  ]);
                })
                .catch(err => console.warn('[RelatorioDiario] Obra não carregada:', err))
            : Promise.resolve(),

          // Criador — filtro direto, sem carregar toda a lista
          diarioData.created_by
            ? base44.entities.User.filter({ email: diarioData.created_by })
                .then(users => { if (users?.length > 0) setCreatorUser(users[0]); })
                .catch(err => console.warn('[RelatorioDiario] Criador não carregado:', err))
            : Promise.resolve(),
        ]);

        setLoading(false);
      } catch (err) {
        console.error('[RelatorioDiario] Erro ao carregar relatório:', err);
        setError('Erro ao carregar o diário');
        setLoading(false);
      }
    };

    load();
  }, []);

  return { diario, obra, project, user, regional, creatorUser, loading, error };
}