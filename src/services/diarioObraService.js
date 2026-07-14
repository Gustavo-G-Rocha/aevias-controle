import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';
import { logger } from '@/utils/logger';
import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { salvarRegistroOfflineAware } from '@/services/offlineSaveService';
import { obterRegistroOfflineAware } from '@/services/offlineRecordLoader';

/**
 * Service centralizado para operações com Diário de Obra
 */
export async function listarDiarios(limit = 500) {
  return withServiceCall(
    () => base44.entities.DiarioObra.list('-created_date', limit),
    'Falha ao carregar diários'
  );
}

export async function listarDiariosPorObra(obraId) {
  return withServiceCall(
    () => base44.entities.DiarioObra.filter({ obra_id: obraId }, '-created_date', 500),
    'Falha ao carregar diários da obra'
  );
}

export async function obterDiarioById(id) {
  return obterRegistroOfflineAware('DiarioObra', id);
}

export async function criarDiario(data) {
  try {
    return await salvarRegistroOfflineAware({ entityName: 'DiarioObra', data, operation: 'create' });
  } catch (error) {
    const validationMessage = error?.response?.data?.error;
    if (validationMessage) throw new Error(validationMessage);
    logger.error('[Service] Falha ao criar diário', error);
    throw new Error('Falha ao criar diário');
  }
}

export async function atualizarDiario(id, data) {
  try {
    return await salvarRegistroOfflineAware({ entityName: 'DiarioObra', data, operation: 'update', recordId: id });
  } catch (error) {
    const validationMessage = error?.response?.data?.error;
    if (validationMessage) throw new Error(validationMessage);
    logger.error('[Service] Falha ao atualizar diário', error);
    throw new Error('Falha ao atualizar diário');
  }
}

export async function deletarDiario(id) {
  return withServiceCall(
    () => base44.entities.DiarioObra.delete(id),
    'Falha ao excluir diário'
  );
}