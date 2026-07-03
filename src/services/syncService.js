/**
 * syncService.js
 * Gerencia sincronização de items da fila com Base44
 */

import { base44 } from '@/api/base44Client';
import {
  getQueueItemsByStatus,
  updateQueueItem,
  removeQueueItem,
  findDuplicateQueueItem,
} from './offlineStorageService';
import { logger } from '@/utils/logger';

/**
 * Sincroniza um item da fila com Base44
 * Atualiza status e attempts conforme resultado
 * @param {object} item - item da fila
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function syncQueueItem(item) {
  if (!item || !item.id) {
    logger.error('[syncService] Item inválido:', item);
    return { success: false, error: 'Item inválido' };
  }

  try {
    // Marcar como sincronizando
    await updateQueueItem(item.id, { status: 'syncing' });

    const { operation, entityType, entityId, payload } = item;

    // Executar operação correspondente
    let result;
    if (operation === 'create') {
      result = await base44.entities[entityType].create(payload);
      logger.log(`[syncService] Created ${entityType}:`, result.id);
    } else if (operation === 'update' && entityId) {
      await base44.entities[entityType].update(entityId, payload);
      result = { id: entityId };
      logger.log(`[syncService] Updated ${entityType}:`, entityId);
    } else {
      throw new Error(`Operação desconhecida: ${operation}`);
    }

    // Marcar como sincronizado e armazenar entityId se necessário
    const updates = { status: 'synced', attempts: item.attempts + 1 };
    if (operation === 'create' && result?.id && !entityId) {
      updates.entityId = result.id;
    }
    await updateQueueItem(item.id, updates);

    return { success: true };
  } catch (error) {
    logger.error(`[syncService] Erro ao sincronizar ${item.id}:`, error?.message);

    // Incrementar tentativas e marcar como falho se exceder limite
    const newAttempts = item.attempts + 1;
    const maxAttempts = 5;

    const updates = {
      attempts: newAttempts,
      lastError: error?.message || String(error),
      status: newAttempts >= maxAttempts ? 'failed' : 'pending',
    };

    await updateQueueItem(item.id, updates);

    return {
      success: false,
      error: error?.message || String(error),
    };
  }
}

/**
 * Sincroniza todos os items pendentes
 * @returns {Promise<{synced: number, failed: number, errors: string[]}>}
 */
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

  // Sincronizar sequencialmente para manter ordem
  for (const item of pendingItems) {
    const result = await syncQueueItem(item);
    if (result.success) {
      synced++;
    } else {
      failed++;
      errors.push(`${item.id}: ${result.error}`);
    }
  }

  logger.log(`[syncService] Sincronização concluída: ${synced} sucesso, ${failed} falha`);

  return { synced, failed, errors };
}

/**
 * Verifica se existe duplicate pendente e o atualiza, senão cria novo
 * @param {object} queueItem - novo item a adicionar
 * @returns {Promise<string>} id do item (novo ou existente)
 */
export async function addOrUpdateQueueItem(queueItem) {
  const { entityType, operation, dataHash } = queueItem;

  // Procurar duplicate
  const existing = await findDuplicateQueueItem(entityType, operation, dataHash);

  if (existing) {
    logger.log(`[syncService] Encontrado duplicate, atualizando:`, existing.id);
    // Atualizar payload do existente com novo payload
    await updateQueueItem(existing.id, {
      payload: queueItem.payload,
      timestamp: Date.now(), // Atualizar timestamp para ser sincronizado depois
    });
    return existing.id;
  }

  // Novo item — adicionar normalmente
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