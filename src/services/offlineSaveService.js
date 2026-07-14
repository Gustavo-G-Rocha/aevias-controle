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
import { resolverFotosOffline } from '@/services/offlinePhotoService';
import { logger } from '@/utils/logger';

/**
 * Verifica se o dispositivo está offline.
 */
function isOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
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
    logger.log(`[offlineSave] Offline — enfileirando ${operation} ${entityName}`);

    const queueItem = createQueueItem({
      operation,
      entityType: entityName,
      entityId: recordId || null,
      payload: data,
      clientUpdatedAt: clientUpdatedAt || new Date().toISOString(),
      baseUpdatedDate: baseUpdatedDate || null,
    });

    await addOrUpdateQueueItem(queueItem);

    // Notificar a barra de status para atualizar o contador de pendentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('offline-queue-updated'));
    }

    // Registro temporário para a UI continuar trabalhando.
    // Marcado com _offline para a UI distinguir (ex: mostrar badge "Pendente sync").
    const tempId = recordId || `offline-${queueItem.id}`;
    return {
      id: tempId,
      ...data,
      _offline: true,
      _queueId: queueItem.id,
      created_date: clientUpdatedAt || new Date().toISOString(),
      updated_date: new Date().toISOString(),
    };
  }

  // Online — caminho normal com validação server-side.
  // Resolve fotos offline (placeholders "local-photo:") ANTES de enviar,
  // para cobrir o caso de foto adicionada offline e salvamento online
  // (conexão instável): o upload da foto pendente é feito aqui.
  let dataToSync = data;
  try {
    dataToSync = await resolverFotosOffline(data);
  } catch (e) {
    logger.warn('[offlineSave] Não foi possível resolver fotos offline no caminho online:', e?.message);
  }

  const response = await validarESalvarRegistro({
    entityName,
    data: dataToSync,
    operation,
    recordId: recordId || undefined,
    client_updated_at: clientUpdatedAt,
    base_updated_date: baseUpdatedDate,
  });
  return response.data.data;
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