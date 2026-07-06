import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Ensaios
 */
const ENSAIO_ENTITIES = {
  'EnsaioCAUQ': 'EnsaioCAUQ',
  'EnsaioMRAF': 'EnsaioMRAF',
  'EnsaioDensidade': 'EnsaioDensidade',
  'EnsaioDensidadeInSitu': 'EnsaioDensidadeInSitu',
  'EnsaioGranulometriaIndividual': 'EnsaioGranulometriaIndividual',
  'EnsaioGranMistura': 'EnsaioGranMistura',
  'EnsaioManchaPendulo': 'EnsaioManchaPendulo',
  'EnsaioProctor': 'EnsaioProctor',
  'EnsaioRompimentoConcreto': 'EnsaioRompimentoConcreto',
  'EnsaioSondagem': 'EnsaioSondagem',
  'EnsaioTaxaMRAF': 'EnsaioTaxaMRAF',
  'EnsaioTaxaPinturaImprimacao': 'EnsaioTaxaPinturaImprimacao',
  'EnsaioVigaBenkelman': 'EnsaioVigaBenkelman',
  'AcompanhamentoCarga': 'AcompanhamentoCarga',
  'AcompanhamentoUsinagem': 'AcompanhamentoUsinagem',
};

export async function listarEnsaios(entityName, limit = 500) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].list('-created_date', limit),
    'Falha ao carregar ensaios'
  );
}

export async function listarEnsaiosPorObra(entityName, obraId) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].filter({ obra_id: obraId }, '-created_date', 500),
    'Falha ao carregar ensaios da obra'
  );
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
  return withServiceCall(
    () => base44.entities[entityName].create(data),
    'Falha ao criar ensaio'
  );
}

export async function atualizarEnsaio(entityName, id, data) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].update(id, data),
    'Falha ao atualizar ensaio'
  );
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
  if (ensaio.peneiras !== undefined) return 'EnsaioGranMistura';
  if (ensaio.levantamentos !== undefined && ensaio.cte_viga !== undefined) return 'EnsaioVigaBenkelman';
  if (ensaio.cargas !== undefined) return 'AcompanhamentoCarga';
  if (ensaio.rodadas_producao !== undefined) return 'ChecklistUsina';
  if (ensaio.cargas_concreto !== undefined) return 'ChecklistConcretagem';
  if (ensaio.acompanhamento_execucao !== undefined && ensaio.empreiteira !== undefined) return 'ChecklistTerraplanagem';
  if (ensaio.controle_aplicacao !== undefined) return 'ChecklistAplicacao';
  if (ensaio.atividades_realizadas !== undefined) return 'DiarioObra';

  throw new Error(`Não foi possível determinar o tipo do registro (id: ${ensaio.id})`);
}