import { base44 } from '@/api/base44Client';
import { obterObraById } from './obrasService';
import { obterRegionalById } from './regionaisService';
import { obterProjectById } from './projectsService';
import { obterFaixaById } from './faixasService';
import { filtrarUsuarios } from './usuariosService';
import { logger } from '@/utils/logger';
import { obterRegistroOfflineAware } from '@/services/offlineRecordLoader';

/**
 * Carrega o par obra → regional a partir do obra_id de um registro.
 * Falha isolada não rejeita o conjunto.
 * @returns {Promise<{ obra: object|null, regional: object|null }>}
 */
export async function carregarObraRegional(obraId) {
  if (!obraId) return { obra: null, regional: null };
  try {
    const obra = await obterObraById(obraId);
    let regional = null;
    if (obra?.regional_id) {
      try {
        regional = await obterRegionalById(obra.regional_id);
      } catch (err) {
        logger.warn('[RelatorioContext] Regional não carregada:', err);
      }
    }
    return { obra, regional };
  } catch (err) {
    logger.warn('[RelatorioContext] Obra não carregada:', err);
    return { obra: null, regional: null };
  }
}

/**
 * Carrega um projeto pelo id, tolerante a falhas.
 */
export async function carregarProject(projectId) {
  if (!projectId) return null;
  try {
    return await obterProjectById(projectId);
  } catch (err) {
    logger.warn('[RelatorioContext] Projeto não carregado:', err);
    return null;
  }
}

/**
 * Carrega a faixa granulométrica vinculada a um projeto (ou diretamente pelo id).
 */
export async function carregarFaixaDoProject(project) {
  if (!project?.faixa_granulometrica_id) return null;
  try {
    return await obterFaixaById(project.faixa_granulometrica_id);
  } catch (err) {
    logger.warn('[RelatorioContext] Faixa granulométrica não carregada:', err);
    return null;
  }
}

/**
 * Carrega o usuário criador do registro (filtro por email).
 */
export async function carregarCreatorUser(email) {
  if (!email) return null;
  try {
    const users = await filtrarUsuarios({ email });
    return users?.length > 0 ? users[0] : null;
  } catch (err) {
    logger.warn('[RelatorioContext] Criador não carregado:', err);
    return null;
  }
}

/**
 * Carrega o contexto completo de um relatório a partir de um registro:
 * obra, regional, project e creatorUser — tudo em paralelo, tolerante a falhas.
 * @param {object} record registro principal (com obra_id, project_id, created_by)
 * @returns {Promise<{ obra, regional, project, creatorUser }>}
 */
export async function carregarContextoRelatorio(record) {
  if (!record) return { obra: null, regional: null, project: null, creatorUser: null };

  const [obraRegional, project, creatorUser] = await Promise.all([
    carregarObraRegional(record.obra_id),
    carregarProject(record.project_id),
    carregarCreatorUser(record.created_by),
  ]);

  return {
    obra: obraRegional.obra,
    regional: obraRegional.regional,
    project,
    creatorUser,
  };
}

/**
 * Leitura genérica de um registro por nome de entidade + id.
 * Usado por hooks de relatório para entidades sem service dedicado.
 */
export async function obterRegistroPorEntidade(entityName, id) {
  return obterRegistroOfflineAware(entityName, id);
}