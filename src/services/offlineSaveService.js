/**
 * offlineSaveService.js
 * Camada única de salvamento com suporte offline (modelo WhatsApp).
 *
 * - Online: chama validarESalvarRegistro (validação server-side) normalmente.
 * - Offline: enfileira a operação no IndexedDB e retorna um registro temporário
 *   para a UI continuar funcionando. Quando a conexão volta, useOfflineSync
 *   envia a fila automaticamente.
 */

import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { createQueueItem } from '@/utils/offlineQueue';
import { addOrUpdateQueueItem } from '@/services/syncService';
import { saveDataCache, getDataCache } from '@/services/offlineStorageService';
import { logger } from '@/utils/logger';

/**
 * Verifica se o dispositivo está offline.
 */
function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

function isNetworkError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === 'ERR_NETWORK' ||
    (!error?.response && !error?.status && (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('internet') ||
      message.includes('load failed')
    ));
}

async function enqueueOffline({ entityName, data, operation, recordId, clientUpdatedAt, baseUpdatedDate }) {
  logger.log(`[offlineSave] Enfileirando ${operation} ${entityName}`);
  const timestamp = clientUpdatedAt || new Date().toISOString();
  const queueItem = createQueueItem({
    operation,
    entityType: entityName,
    entityId: recordId || null,
    payload: data,
    clientUpdatedAt: timestamp,
    baseUpdatedDate: baseUpdatedDate || null,
  });

  await addOrUpdateQueueItem(queueItem);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offline-queue-updated'));
  }

  return {
    id: recordId || `offline-${queueItem.id}`,
    ...data,
    entityType: entityName,
    _offline: true,
    _queueId: queueItem.id,
    created_date: timestamp,
    updated_date: timestamp,
  };
}

/**
 * Salva (cria ou atualiza) um registro com suporte offline.
 *
 * @param {object} opts
 * @param {string} opts.entityName - nome da entidade (ex: "EnsaioCAUQ")
 * @param {object} opts.data - payload do registro
 * @param {'create'|'update'} opts.operation - tipo de operação
 * @param {string} [opts.recordId] - ID do registro (apenas update)
 * @param {string} [opts.clientUpdatedAt] - timestamp do cliente (para LWW)
 * @param {string} [opts.baseUpdatedDate] - updated_date do servidor (para LWW)
 * @returns {Promise<object>} o registro salvo (do servidor quando online, temporário quando offline)
 */
export async function salvarRegistroOfflineAware({
  entityName,
  data,
  operation,
  recordId,
  clientUpdatedAt,
  baseUpdatedDate,
}) {
  if (isOffline()) {
    return enqueueOffline({ entityName, data, operation, recordId, clientUpdatedAt, baseUpdatedDate });
  }

  // Tenta o caminho online. Se o aparelho ainda indicar conexão, mas a rede
  // já tiver caído, salva automaticamente na fila offline em vez de falhar.
  try {
    const response = await validarESalvarRegistro({
      entityName,
      data,
      operation,
      recordId: recordId || undefined,
      client_updated_at: clientUpdatedAt,
      base_updated_date: baseUpdatedDate,
    });
    return response.data.data;
  } catch (error) {
    if (!isNetworkError(error)) throw error;
    return enqueueOffline({ entityName, data, operation, recordId, clientUpdatedAt, baseUpdatedDate });
  }
}

/**
 * Lê um único registro do cache offline (quando disponível).
 * Útil para páginas de detalhe/relatório que precisam renderizar offline.
 *
 * @param {string} entityName
 * @param {string} recordId
 * @returns {Promise<object|null>}
 */
export async function obterRegistroDoCache(entityName, recordId) {
  const cached = await getDataCache(`record:${entityName}:${recordId}`);
  return cached?.data || null;
}

/**
 * Salva um registro individual no cache de leitura (para visualização offline
 * em páginas de detalhe/relatório).
 *
 * @param {string} entityName
 * @param {object} record
 */
export async function cacheRecord(entityName, record) {
  if (!record?.id) return;
  await saveDataCache(`record:${entityName}:${record.id}`, record, 'records');
}