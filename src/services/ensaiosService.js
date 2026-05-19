import { base44 } from '@/api/base44Client';

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
  return base44.entities[entityName].list('-created_date', limit);
}

export async function listarEnsaiosPorObra(entityName, obraId) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return base44.entities[entityName].filter({ obra_id: obraId }, '-created_date', 500);
}

export async function obterEnsaioById(entityName, id) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return base44.entities[entityName].read(id);
}

export async function criarEnsaio(entityName, data) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return base44.entities[entityName].create(data);
}

export async function atualizarEnsaio(entityName, id, data) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return base44.entities[entityName].update(id, data);
}

export async function deletarEnsaio(entityName, id) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return base44.entities[entityName].delete(id);
}

export async function obterSchemaEnsaio(entityName) {
  if (!ENSAIO_ENTITIES[entityName]) {
    throw new Error(`Entidade ensaio desconhecida: ${entityName}`);
  }
  return base44.entities[entityName].schema();
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

  return base44.entities[entityName].update(ensaio.id, signatureData);
}

export async function aprovarEnsaio(ensaio, user, obras) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);
  const obra = obras?.find(o => o.id === ensaio.obra_id);

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

  return base44.entities[entityName].update(ensaio.id, approvalData);
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

  return base44.entities[entityName].update(ensaio.id, rejectionData);
}

export async function excluirEnsaio(ensaio) {
  if (!ensaio?.id) {
    throw new Error('Ensaio inválido');
  }

  const entityName = detectEntityName(ensaio);
  return base44.entities[entityName].delete(ensaio.id);
}

function detectEntityName(ensaio) {
  // Detectar tipo de entidade baseado nas propriedades presentes
  if (ensaio.faixa_trabalho) return 'EnsaioCAUQ';
  if (ensaio.teor_ligante_residual) return 'EnsaioMRAF';
  if (ensaio.peneiras) return 'EnsaioGranulometriaIndividual';
  if (ensaio.pesos) return 'EnsaioDensidade';
  if (ensaio.corpos_prova_marshall) return 'EnsaioCAUQ';
  throw new Error('Não foi possível determinar o tipo de ensaio');
}