import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { logger } from '@/utils/logger';
import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';

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
  return withServiceCall(
    () => base44.entities[entityName].delete(id),
    'Falha ao excluir ensaio'
  );
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

  const entityName = Object.keys(ENSAIO_ENTITIES).find(key =>
    ENSAIO_ENTITIES[key] === ensaio.constructor?.name || key === ensaio.tipo_ensaio
  ) || detectEntityName(ensaio);

  const signatureData = {
    client_signature: {
      signed_by: user.email,
      signed_date: new Date().toISOString(),
      engineer_name: user.full_name || user.laboratorista_name,
      crea_number: user.crea_number || ''
    }
  };

  return withServiceCall(
    () => base44.entities[entityName].update(ensaio.id, signatureData),
    'Falha ao assinar ensaio'
  );
}

export async function aprovarEnsaio(ensaio, user) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);

  const approvalData = {
    approved: true,
    approved_by: user.email,
    approved_date: new Date().toISOString(),
    approver_details: {
      name: user.full_name || user.laboratorista_name,
      position: user.access_level || user.role,
      crea_number: user.crea_number || ''
    }
  };

  return withServiceCall(
    () => base44.entities[entityName].update(ensaio.id, approvalData),
    'Falha ao aprovar ensaio'
  );
}

export async function reprovarEnsaio(ensaio, user, rejectionReason) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);

  const rejectionData = {
    approved: false,
    approved_by: user.email,
    approved_date: new Date().toISOString(),
    rejection_reason: rejectionReason,
    was_rejected: true,
    approver_details: {
      name: user.full_name || user.laboratorista_name,
      position: user.access_level || user.role,
      crea_number: user.crea_number || ''
    }
  };

  return withServiceCall(
    () => base44.entities[entityName].update(ensaio.id, rejectionData),
    'Falha ao reprovar ensaio'
  );
}

export async function excluirEnsaio(ensaio) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);
  return withServiceCall(
    () => base44.entities[entityName].delete(ensaio.id),
    'Falha ao excluir ensaio'
  );
}

function detectEntityName(ensaio) {
  // Usar o campo entityType adicionado pelo recordsService (fonte primária)
  if (ensaio.entityType) return ensaio.entityType;

  // Fallbacks por propriedades características
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