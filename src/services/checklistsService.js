import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Checklists
 */
const CHECKLIST_ENTITIES = {
  'CertificacaoUsina': 'CertificacaoUsina',
  'ChecklistUsina': 'ChecklistUsina',
  'ChecklistAplicacao': 'ChecklistAplicacao',
  'ChecklistMRAF': 'ChecklistMRAF',
  'ChecklistConcretagem': 'ChecklistConcretagem',
  'ChecklistTerraplanagem': 'ChecklistTerraplanagem',
  'ChecklistReciclagem': 'ChecklistReciclagem',
};

export async function listarChecklists(entityName, limit = 500) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].list('-created_date', limit),
    'Falha ao carregar checklists'
  );
}

export async function listarChecklistsPorObra(entityName, obraId) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].filter({ obra_id: obraId }, '-created_date', 500),
    'Falha ao carregar checklists da obra'
  );
}

export async function obterChecklistById(entityName, id) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].read(id),
    'Falha ao carregar checklist'
  );
}

export async function criarChecklist(entityName, data) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].create(data),
    'Falha ao criar checklist'
  );
}

export async function atualizarChecklist(entityName, id, data) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].update(id, data),
    'Falha ao atualizar checklist'
  );
}

export async function deletarChecklist(entityName, id) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].delete(id),
    'Falha ao excluir checklist'
  );
}

export async function obterSchemaChecklist(entityName) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    () => base44.entities[entityName].schema(),
    'Falha ao carregar esquema do checklist'
  );
}