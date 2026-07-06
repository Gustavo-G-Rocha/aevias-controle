/**
 * Hook de carregamento de dados para RelatorioNC.
 * Busca dados do RNC e registros vinculados.
 */
import { useState, useEffect } from 'react';
import { obterUsuarioAtual, listarUsuarios } from '@/services/usuariosService';
import { listarObrasRecentes } from '@/services/obrasService';
import { listarRegionais } from '@/services/regionaisService';
import { listarProjects } from '@/services/projectsService';
import { obterRegistroPorEntidade } from '@/services/relatorioContextService';
import { logger } from '@/utils/logger';
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
          obterRegistroPorEntidade('RelatorioNC', id),
          obterUsuarioAtual(),
          listarObrasRecentes(),
          listarRegionais(),
          listarProjects(),
          listarUsuarios(),
        ]);

      if (!nc) throw new Error('RNC não encontrado');

      const obra = findObra(nc, obras);
      const regional = findRegional(obra, regionais);

      let registroVinculado = null;
      let project = null;
      let creatorUser = null;

      if (nc.checklist_ref_tipo && nc.checklist_ref_id) {
        try {
          registroVinculado = await obterRegistroPorEntidade(
            nc.checklist_ref_tipo,
            nc.checklist_ref_id,
          );
          project = findProject(registroVinculado, projects);
          creatorUser = findCreatorUser(registroVinculado, allUsers);
        } catch (e) {
          logger.warn('Registro vinculado não encontrado:', e);
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
  }, []);

  return { loading, error, data };
};