import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { logger } from '@/utils/logger';
import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { salvarRegistroOfflineAware } from '@/services/offlineSaveService';

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

function isNotFoundError(error) {
  const status = error?.status ?? error?.response?.status;
  if (status === 404) return true;
  return /not\s*found|não\s*encontrad/i.test(String(error?.message || ''));
}

export async function obterChecklistById(entityName, id) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  return withServiceCall(
    async () => {
      try {
        return await base44.entities[entityName].get(id);
      } catch (e1) {
        // 404 = registro realmente não existe; não retentar.
        if (isNotFoundError(e1)) throw e1;
        // Falha transitória (5xx, rede, rate-limit): retenta uma vez.
        await new Promise(r => setTimeout(r, 500));
        return await base44.entities[entityName].get(id);
      }
    },
    'Falha ao carregar checklist'
  );
}

export async function criarChecklist(entityName, data) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  try {
    return await salvarRegistroOfflineAware({ entityName, data, operation: 'create' });
  } catch (error) {
    const validationMessage = error?.response?.data?.error;
    if (validationMessage) throw new Error(validationMessage);
    logger.error('[Service] Falha ao criar checklist', error);
    throw new Error('Falha ao criar checklist');
  }
}

export async function atualizarChecklist(entityName, id, data) {
  if (!CHECKLIST_ENTITIES[entityName]) {
    throw new Error(`Entidade checklist desconhecida: ${entityName}`);
  }
  try {
    return await salvarRegistroOfflineAware({ entityName, data, operation: 'update', recordId: id });
  } catch (error) {
    const validationMessage = error?.response?.data?.error;
    if (validationMessage) throw new Error(validationMessage);
    logger.error('[Service] Falha ao atualizar checklist', error);
    throw new Error('Falha ao atualizar checklist');
  }
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