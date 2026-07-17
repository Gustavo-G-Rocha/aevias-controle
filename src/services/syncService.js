/**
 * syncService.js
 * Gerencia sincronização de items da fila com Base44.
 *
 * Roteia todas as operações através de `validarESalvarRegistro` para
 * garantir validação server-side e detecção de conflitos (LWW).
 * Conflitos são armazenados em IndexedDB para resolução pelo usuário.
 */

import { base44 } from '@/api/base44Client';
import {
  getQueueItemsByStatus,
  updateQueueItem,
  removeQueueItem,
  findDuplicateQueueItem,
  addConflict,
  removeConflict,
} from './offlineStorageService';
import { resolverFotosOffline } from '@/services/offlinePhotoService';
import { validarESalvarRegistro } from '@/functions/validarESalvarRegistro';
import { logger } from '@/utils/logger';

/**
 * Sincroniza um item da fila com Base44.
 * Detecta conflitos (LWW) e os armazena para resolução manual.
 * @param {object} item - item da fila
 * @returns {Promise<{success: boolean, error?: string, conflict?: boolean}>}
 */
export async function syncQueueItem(item) {
  if (!item || !item.id) {
    logger.error('[syncService] Item inválido:', item);
    return { success: false, error: 'Item inválido' };
  }

  try {
    await updateQueueItem(item.id, { status: 'syncing' });

    const { operation, entityType, entityId, payload, clientUpdatedAt, baseUpdatedDate } = item;

    // Resolver fotos offline ANTES de enviar — substitui placeholders
    // "local-photo:<id>" pelas URLs reais (faz upload das pendentes).
    const payloadToSync = await resolverFotosOffline(payload);

    // Rotear através de validarESalvarRegistro para validação server-side
    // e detecção de conflitos (LWW).
    let result;
    try {
      const response = await validarESalvarRegistro({
        entityName: entityType,
        data: payloadToSync,
        operation,
        recordId: entityId || undefined,
        client_updated_at: clientUpdatedAt,
        base_updated_date: baseUpdatedDate,
      });
      result = response.data.data;
      logger.log(`[syncService] ${operation} ${entityType}:`, result?.id || entityId);
    } catch (error) {
      // 409 = conflito de sincronização (LWW)
      const errorStatus = error?.response?.status || error?.status;
      const errorData = error?.response?.data || error?.data || {};

      if (errorStatus === 409 || errorData.conflict) {
        await addConflict({
          queueItemId: item.id,
          entityType,
          entityId: entityId || errorData.serverData?.id,
          entityName: entityType,
          localData: payload,
          serverData: errorData.serverData,
          clientUpdatedAt: clientUpdatedAt || item.timestamp,
          serverUpdatedDate: errorData.serverUpdatedDate,
          conflictReason: errorData.error || 'Conflito de sincronização',
          status: 'pending',
        });

        // Marcar como 'conflict' — não retentar automaticamente
        await updateQueueItem(item.id, {
          status: 'conflict',
          attempts: item.attempts + 1,
          lastError: errorData.error || 'Conflito de sincronização',
        });

        return {
          success: false,
          error: errorData.error || 'Conflito de sincronização',
          conflict: true,
        };
      }
      throw error;
    }

    // Marcar como sincronizado e armazenar entityId se necessário
    const updates = { status: 'synced', attempts: item.attempts + 1 };
    if (operation === 'create' && result?.id && !entityId) {
      updates.entityId = result.id;
    }
    await updateQueueItem(item.id, updates);

    return { success: true };
  } catch (error) {
    // Extrai a mensagem real do servidor (ex: "Obra não encontrada") em vez
    // de um genérico "Request failed with status code 400".
    const errorStatus = error?.response?.status || error?.status;
    const serverMsg = error?.response?.data?.error || error?.message || String(error);
    logger.error(`[syncService] Erro ao sincronizar ${item.id}:`, serverMsg);

    const newAttempts = (item.attempts || 0) + 1;
    const maxAttempts = 5;

    // Erros permanentes (validação/permissão 4xx) nunca vão passar retentando —
    // marca como 'failed' imediatamente para não ficar enviando infinitamente.
    const isPermanent = errorStatus >= 400 && errorStatus < 500 && errorStatus !== 408 && errorStatus !== 429;

    const updates = {
      attempts: newAttempts,
      lastError: serverMsg,
      status: (isPermanent || newAttempts >= maxAttempts) ? 'failed' : 'pending',
    };

    await updateQueueItem(item.id, updates);

    return {
      success: false,
      error: serverMsg,
    };
  }
}

/**
 * Recoloca os itens 'failed' na fila como 'pending' (zera tentativas)
 * e dispara uma nova sincronização. Usado pelo botão "Tentar novamente".
 * @returns {Promise<{synced: number, failed: number, errors: string[]}>}
 */
export async function retryFailedItems() {
  const failedItems = await getQueueItemsByStatus('failed');
  for (const item of failedItems) {
    await updateQueueItem(item.id, { status: 'pending', attempts: 0, lastError: null });
  }
  return syncPendingItems();
}

/**
 * Força a sincronização de um item, sobrescrevendo o registro no servidor.
 * Usado quando o usuário escolhe "Usar minha versão" na resolução de conflito.
 * Campos server-authoritative (aprovação, assinatura) são preservados.
 * @param {object} item - item da fila em conflito
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function forceSyncQueueItem(item) {
  if (!item || !item.id) {
    return { success: false, error: 'Item inválido' };
  }

  try {
    await updateQueueItem(item.id, { status: 'syncing' });

    const { operation, entityType, entityId, payload, clientUpdatedAt } = item;
    const payloadToSync = await resolverFotosOffline(payload);

    const response = await validarESalvarRegistro({
      entityName: entityType,
      data: payloadToSync,
      operation,
      recordId: entityId || undefined,
      client_updated_at: clientUpdatedAt,
      force_overwrite: true,
    });

    logger.log(`[syncService] Force-synced ${entityType}:`, entityId);

    await updateQueueItem(item.id, { status: 'synced', attempts: item.attempts + 1 });

    return { success: true };
  } catch (error) {
    logger.error(`[syncService] Erro ao forçar sincronização ${item.id}:`, error?.message);

    await updateQueueItem(item.id, {
      status: 'conflict',
      attempts: item.attempts + 1,
      lastError: error?.message || String(error),
    });

    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Sincroniza todos os items pendentes.
 * Items com status 'conflict' não são sincronizados automaticamente.
 * @returns {Promise<{synced: number, failed: number, errors: string[]}>}
 */
const SYNC_CONCURRENCY = 5; // registros distintos sincronizam em paralelo (lotes de 5)

export async function syncPendingItems() {
  logger.log('[syncService] Iniciando sincronização de items pendentes');

  const pendingItems = await getQueueItemsByStatus('pending');
  if (pendingItems.length === 0) {
    logger.log('[syncService] Nenhum item pendente');
    return { synced: 0, failed: 0, errors: [] };
  }

  logger.log(`[syncService] ${pendingItems.length} items pendentes para sincronizar`);

  let synced = 0;
  let failed = 0;
  const errors = [];

  // Agrupar por registro: itens do MESMO registro (ex.: create seguido de
  // update) sincronizam em ordem; registros DIFERENTES sincronizam em
  // paralelo em lotes de SYNC_CONCURRENCY. Antes a fila era 100% sequencial
  // (tempo total = nº de itens × latência da rede).
  const groups = new Map();
  for (const item of pendingItems) {
    const key = `${item.entityType}:${item.entityId || item.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const processGroup = async (items) => {
    for (const item of items) {
      const result = await syncQueueItem(item);
      if (result.success) {
        synced++;
      } else if (result.conflict) {
        // Conflitos não contam como falha — aguardam resolução do usuário
        logger.log(`[syncService] Conflito detectado para ${item.id}`);
      } else {
        failed++;
        errors.push(`${item.id}: ${result.error}`);
      }
    }
  };

  const groupList = [...groups.values()];
  for (let i = 0; i < groupList.length; i += SYNC_CONCURRENCY) {
    await Promise.all(groupList.slice(i, i + SYNC_CONCURRENCY).map(processGroup));
  }

  logger.log(`[syncService] Sincronização concluída: ${synced} sucesso, ${failed} falha`);

  return { synced, failed, errors };
}

/**
 * Resolve um conflito: força sobrescrita ou descarta alterações locais.
 * @param {object} conflict - registro de conflito do IndexedDB
 * @param {'force'|'discard'} resolution
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function resolveConflict(conflict, resolution) {
  if (!conflict || !resolution) {
    return { success: false, error: 'Conflito ou resolução inválida' };
  }

  try {
    if (resolution === 'force') {
      // Forçar sobrescrita — usar a versão do usuário
      const queueItem = {
        id: conflict.queueItemId,
        operation: 'update',
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        payload: conflict.localData,
        clientUpdatedAt: conflict.clientUpdatedAt,
        attempts: 0,
      };

      const result = await forceSyncQueueItem(queueItem);
      if (result.success) {
        await removeConflict(conflict.id);
      }
      return result;
    } else {
      // Descartar — manter versão do servidor
      await updateQueueItem(conflict.queueItemId, {
        status: 'synced',
        lastError: null,
      });
      await removeConflict(conflict.id);
      return { success: true };
    }
  } catch (error) {
    logger.error('[syncService] Erro ao resolver conflito:', error?.message);
    return { success: false, error: error?.message || String(error) };
  }
}

/**
 * Verifica se existe duplicate pendente e o atualiza, senão cria novo
 * @param {object} queueItem - novo item a adicionar
 * @returns {Promise<string>} id do item (novo ou existente)
 */
export async function addOrUpdateQueueItem(queueItem) {
  const { entityType, operation, dataHash } = queueItem;

  const existing = await findDuplicateQueueItem(entityType, operation, dataHash);

  if (existing) {
    logger.log(`[syncService] Encontrado duplicate, atualizando:`, existing.id);
    await updateQueueItem(existing.id, {
      payload: queueItem.payload,
      timestamp: Date.now(),
      clientUpdatedAt: queueItem.clientUpdatedAt,
      baseUpdatedDate: queueItem.baseUpdatedDate,
    });
    return existing.id;
  }

  const { addQueueItem } = await import('./offlineStorageService');
  const id = await addQueueItem(queueItem);
  logger.log(`[syncService] Novo item adicionado:`, id);
  return id;
}

/**
 * Remove item da fila (para testes ou cleanup manual)
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function discardQueueItem(itemId) {
  logger.log('[syncService] Descartando item:', itemId);
  await removeQueueItem(itemId);
}