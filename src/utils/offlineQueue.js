/**
 * offlineQueue.js
 * Utilitário para estrutura e operações de fila offline
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { logger } from '@/utils/logger';

/**
 * Gera hash SHA-256 simples do payload para deduplicação
 * @param {object} payload
 * @returns {string}
 */
export function generatePayloadHash(payload) {
  try {
    const jsonStr = JSON.stringify(payload);
    // Para browser, usar SubtleCrypto
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      // Implementar async se necessário, por enquanto retornar hash simples
      return btoa(jsonStr).substring(0, 32); // Simplificado
    }
    // Fallback: usar crypto do Node (não deve chegar aqui em produção)
    return crypto.createHash('sha256').update(jsonStr).digest('hex').substring(0, 32);
  } catch (e) {
    logger.error('[offlineQueue] Erro ao gerar hash:', e);
    return `hash-${Date.now()}`;
  }
}

/**
 * Cria novo item de fila
 * @param {object} options
 * @returns {object}
 */
export function createQueueItem({
  operation = 'create',
  entityType = '',
  entityId = null,
  payload = {},
  clientUpdatedAt = null,
  baseUpdatedDate = null,
} = {}) {
  const dataHash = generatePayloadHash(payload);
  
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    operation,
    entityType,
    entityId,
    payload,
    dataHash,
    clientUpdatedAt: clientUpdatedAt || new Date().toISOString(),
    baseUpdatedDate,
    attempts: 0,
    lastError: null,
    status: 'pending', // pending | syncing | synced | failed | conflict
  };
}

/**
 * Valida estrutura de item da fila
 * @param {object} item
 * @returns {boolean}
 */
export function isValidQueueItem(item) {
  return !!(
    item &&
    typeof item === 'object' &&
    item.id &&
    typeof item.timestamp === 'number' &&
    item.operation &&
    item.entityType &&
    item.payload &&
    ['pending', 'syncing', 'synced', 'failed', 'conflict'].includes(item.status)
  );
}

/**
 * Determina se dois itens são "duplicados" (mesmo entityType, operation, dataHash)
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 */
export function areQueueItemsDuplicate(item1, item2) {
  return !!(
    item1.entityType === item2.entityType &&
    item1.operation === item2.operation &&
    item1.dataHash === item2.dataHash
  );
}