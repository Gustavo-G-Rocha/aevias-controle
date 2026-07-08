import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { logger } from '@/utils/logger';
import { captureError } from '@/utils/observability';
import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { gerenciarAprovacao } from '@/functions/gerenciarAprovacao';

/**
 * Service centralizado para operações com Ensaios
 */
const ENSAIO_ENTITIES = {
  'EnsaioCAUQ': 'EnsaioCAUQ',
  'EnsaioMRAF': 'EnsaioMRAF',
  'EnsaioDensidade': 'EnsaioDensidade',
  'EnsaioDensidadeInSitu': 'EnsaioDensidadeInSitu',
  'EnsaioGranulometriaIndividual': 'EnsaioGranulometriaIndividual',
  'EnsaioManchaPendulo': 'EnsaioManchaPendulo',
  'EnsaioProctor': 'EnsaioProctor',
  'EnsaioRompimentoConcreto': 'EnsaioRompimentoConcreto',
  'EnsaioSondagem': 'EnsaioSondagem',
  'EnsaioTaxaMRAF': 'EnsaioTaxaMRAF',
  'EnsaioTaxaPinturaImprimacao': 'EnsaioTaxaPinturaImprimacao',
  'EnsaioVigaBenkelman': 'EnsaioVigaBenkelman',
  'AcompanhamentoCarga': 'AcompanhamentoCarga',
  'AcompanhamentoUsinagem': 'AcompanhamentoUsinagem',
  'BoletimSondagem': 'BoletimSondagem',
  'BoletimSondagemTrado': 'BoletimSondagemTrado',
};

const DEFAULT_PAGE_SIZE = 100;

/**
 * Lista ensaios com paginação real (offset-based via skip).
 * @param {string} entityName
 * @param {{ page?: number, pageSize?: number }} opts
 * @returns {Promise<{ data: object[], page: number, pageSize: number, hasMore: boolean }>}
 */
export async function listarEnsaios(entityName, { page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  const skip = (page - 1) * pageSize;
  const data = await withServiceCall(
    () => base44.entities[entityName].list('-created_date', pageSize + 1, skip),
    'Falha ao carregar ensaios'
  );
  const hasMore = data.length > pageSize;
  return {
    data: hasMore ? data.slice(0, pageSize) : data,
    page,
    pageSize,
    hasMore,
  };
}

/**
 * Lista ensaios de uma obra com paginação real (offset-based via skip).
 * @param {string} entityName
 * @param {string} obraId
 * @param {{ page?: number, pageSize?: number }} opts
 * @returns {Promise<{ data: object[], page: number, pageSize: number, hasMore: boolean }>}
 */
export async function listarEnsaiosPorObra(entityName, obraId, { page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  const skip = (page - 1) * pageSize;
  const data = await withServiceCall(
    () => base44.entities[entityName].filter({ obra_id: obraId }, '-created_date', pageSize + 1, skip),
    'Falha ao carregar ensaios da obra'
  );
  const hasMore = data.length > pageSize;
  return {
    data: hasMore ? data.slice(0, pageSize) : data,
    page,
    pageSize,
    hasMore,
  };
}

export async function obterEnsaioById(entityName, id) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].get(id),
    'Falha ao carregar ensaio'
  );
}

export async function criarEnsaio(entityName, data) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  try {
    const response = await validarESalvarRegistro({ entityName, data, operation: 'create' });
    return response.data.data;
  } catch (error) {
    captureError(error, { entity: entityName, operation: 'create' });
    const validationMessage = error?.response?.data?.error;
    if (validationMessage) throw new Error(validationMessage);
    logger.error('[Service] Falha ao criar ensaio', error);
    throw new Error('Falha ao criar ensaio');
  }
}

export async function atualizarEnsaio(entityName, id, data) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  try {
    const response = await validarESalvarRegistro({ entityName, data, operation: 'update', recordId: id });
    return response.data.data;
  } catch (error) {
    captureError(error, { entity: entityName, operation: 'update' });
    const validationMessage = error?.response?.data?.error;
    if (validationMessage) throw new Error(validationMessage);
    logger.error('[Service] Falha ao atualizar ensaio', error);
    throw new Error('Falha ao atualizar ensaio');
  }
}

export async function deletarEnsaio(entityName, id) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  const response = await gerenciarAprovacao({
    action: 'delete',
    entityName,
    recordId: id,
  });
  return response.data.data;
}

export async function obterSchemaEnsaio(entityName) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].schema(),
    'Falha ao carregar esquema do ensaio'
  );
}

export async function assinarEnsaio(ensaio, user) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);

  const response = await gerenciarAprovacao({
    action: 'sign',
    entityName,
    recordId: ensaio.id,
  });
  return response.data.data;
}

export async function aprovarEnsaio(ensaio, user) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);

  const response = await gerenciarAprovacao({
    action: 'approve',
    entityName,
    recordId: ensaio.id,
  });
  return response.data.data;
}

export async function reprovarEnsaio(ensaio, user, rejectionReason) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);

  const response = await gerenciarAprovacao({
    action: 'reject',
    entityName,
    recordId: ensaio.id,
    rejectionReason,
  });
  return response.data.data;
}

export async function excluirEnsaio(ensaio) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);
  const response = await gerenciarAprovacao({
    action: 'delete',
    entityName,
    recordId: ensaio.id,
  });
  return response.data.data;
}

function detectEntityName(ensaio) {
  // Fonte primária: entityType injetado pelo recordsService.normalizeRecords
  if (ensaio.entityType) return ensaio.entityType;

  // Fonte secundária: entityName injetado por useProdutividadeData.processarRegistros
  if (ensaio.entityName) return ensaio.entityName;

  // ── Fallback heurístico por propriedades (ÚLTIMO RECURSO) ──────────────
  // RISCO: se uma entidade ganhar/perder um campo, a classificação pode
  // ficar incorreta silenciosamente. O log abaixo sinaliza quando este
  // caminho é usado para facilitar diagnóstico. Sempre prefira injetar
  // entityType/entityName na origem em vez de depender destes checks.
  logger.error('[ensaiosService] detectEntityName: usando fallback heurístico para registro', ensaio.id);

  if (ensaio.corpos_prova_marshall !== undefined) return 'EnsaioCAUQ';
  if (ensaio.extracao_ligante !== undefined) return 'EnsaioCAUQ';
  if (ensaio.teor_ligante_residual !== undefined) return 'EnsaioMRAF';
  if (ensaio.pesos !== undefined) return 'EnsaioDensidade';
  if (ensaio.agregados !== undefined && ensaio.tipo_material !== undefined) return 'EnsaioGranulometriaIndividual';
  if (ensaio.peneiras !== undefined) return 'GranuMistura';
  if (ensaio.levantamentos !== undefined && ensaio.cte_viga !== undefined) return 'EnsaioVigaBenkelman';
  if (ensaio.cargas !== undefined) return 'AcompanhamentoCarga';
  if (ensaio.rodadas_producao !== undefined) return 'ChecklistUsina';
  if (ensaio.cargas_concreto !== undefined) return 'ChecklistConcretagem';
  if (ensaio.acompanhamento_execucao !== undefined && ensaio.empreiteira !== undefined) return 'ChecklistTerraplanagem';
  if (ensaio.controle_aplicacao !== undefined) return 'ChecklistAplicacao';
  if (ensaio.atividades_realizadas !== undefined) return 'DiarioObra';

  throw new Error(`Não foi possível determinar o tipo do registro (id: ${ensaio.id})`);
}