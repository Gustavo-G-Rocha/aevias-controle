/**
 * Hook de carregamento de dados para RelatorioNC.
 * Busca dados do RNC e registros vinculados.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  findObra,
  findRegional,
  findProject,
  findCreatorUser,
} from '@/utils/relatorioNCUtils';

export const useRelatorioNCData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (!id) throw new Error('ID do RNC não informado');

      const [nc, user, obras, regionais, projects, allUsers] =
        await Promise.all([
          base44.entities.RelatorioNC.get(id),
          base44.auth.me(),
          base44.entities.Obra.list(),
          base44.entities.Regional.list(),
          base44.entities.Project.list(),
          base44.entities.User.list(),
        ]);

      if (!nc) throw new Error('RNC não encontrado');

      const obra = findObra(nc, obras);
      const regional = findRegional(obra, regionais);

      let registroVinculado = null;
      let project = null;
      let creatorUser = null;

      if (nc.checklist_ref_tipo && nc.checklist_ref_id) {
        try {
          registroVinculado = await base44.entities[
            nc.checklist_ref_tipo
          ].get(nc.checklist_ref_id);
          project = findProject(registroVinculado, projects);
          creatorUser = findCreatorUser(registroVinculado, allUsers);
        } catch (e) {
          console.warn('Registro vinculado não encontrado:', e);
        }
      }

      setData({
        nc,
        obra,
        regional,
        user,
        registroVinculado,
        project,
        creatorUser,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, error, data };
};