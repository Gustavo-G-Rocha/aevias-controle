import { logger } from '@/utils/logger';

/**
 * offlineStorageService.js
 * Gerencia IndexedDB para armazenamento offline
 * Stores: queueItems (fila de sincronização), conflicts (conflitos LWW)
 */

const DB_NAME = 'aevias-offline-v1';
const STORE_QUEUE = 'queueItems';
const STORE_CONFLICTS = 'conflicts';
const STORE_DATA_CACHE = 'dataCache';
const STORE_PHOTOS = 'offlinePhotos';
const DB_VERSION = 4;

let db = null;

/**
 * Inicializa o banco de dados IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
  if (db) return db;

  if (typeof indexedDB === 'undefined') {
    throw new Error('[offlineStorage] IndexedDB não disponível neste ambiente');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('[offlineStorage] Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      logger.log('[offlineStorage] IndexedDB inicializado');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store para fila de sincronização
      if (!database.objectStoreNames.contains(STORE_QUEUE)) {
        const store = database.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('entityType', 'entityType', { unique: false });
        store.createIndex('dataHash', 'dataHash', { unique: false });
        logger.log('[offlineStorage] Store criado:', STORE_QUEUE);
      }

      // Store para conflitos de sincronização (LWW)
      if (!database.objectStoreNames.contains(STORE_CONFLICTS)) {
        const conflictStore = database.createObjectStore(STORE_CONFLICTS, { keyPath: 'id' });
        conflictStore.createIndex('entityType', 'entityType', { unique: false });
        conflictStore.createIndex('status', 'status', { unique: false });
        conflictStore.createIndex('queueItemId', 'queueItemId', { unique: false });
        logger.log('[offlineStorage] Store criado:', STORE_CONFLICTS);
      }

      // Store para cache de dados de leitura (offline viewing)
      if (!database.objectStoreNames.contains(STORE_DATA_CACHE)) {
        const cacheStore = database.createObjectStore(STORE_DATA_CACHE, { keyPath: 'cacheKey' });
        cacheStore.createIndex('category', 'category', { unique: false });
        logger.log('[offlineStorage] Store criado:', STORE_DATA_CACHE);
      }

      // Store para fotos tiradas offline (base64) — upload pendente
      if (!database.objectStoreNames.contains(STORE_PHOTOS)) {
        const photoStore = database.createObjectStore(STORE_PHOTOS, { keyPath: 'photoId' });
        photoStore.createIndex('status', 'status', { unique: false });
        logger.log('[offlineStorage] Store criado:', STORE_PHOTOS);
      }
    };
  });
}

// ── Queue Items ──────────────────────────────────────────────────

/**
 * Adiciona item à fila
 * @param {object} item
 * @returns {Promise<string>} id do item
 */
export async function addQueueItem(item) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.add(item);

    request.onerror = () => {
      logger.error('[offlineStorage] Erro ao adicionar item:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      logger.log('[offlineStorage] Item adicionado:', item.id);
      resolve(item.id);
    };
  });
}

/**
 * Obtém item da fila por ID
 * @param {string} itemId
 * @returns {Promise<object|null>}
 */
export async function getQueueItem(itemId) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.get(itemId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Atualiza item da fila
 * @param {string} itemId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export async function updateQueueItem(itemId, updates) {
  const database = await initDB();

  const item = await getQueueItem(itemId);
  if (!item) {
    throw new Error(`Item ${itemId} não encontrado`);
  }

  const updated = { ...item, ...updates };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.put(updated);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      logger.log('[offlineStorage] Item atualizado:', itemId);
      resolve();
    };
  });
}

/**
 * Remove item da fila
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function removeQueueItem(itemId) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.delete(itemId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      logger.log('[offlineStorage] Item removido:', itemId);
      resolve();
    };
  });
}

/**
 * Lista todos os items da fila com status específico
 * @param {string} status
 * @returns {Promise<object[]>}
 */
export async function getQueueItemsByStatus(status) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    const index = store.index('status');
    const request = index.getAll(status);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Busca item da fila por entityType, operation, dataHash (deduplicação)
 * @param {string} entityType
 * @param {string} operation
 * @param {string} dataHash
 * @returns {Promise<object|null>}
 */
export async function findDuplicateQueueItem(entityType, operation, dataHash) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const items = request.result || [];
      const duplicate = items.find(
        (item) =>
          item.entityType === entityType &&
          item.operation === operation &&
          item.dataHash === dataHash &&
          item.status !== 'synced'
      );
      resolve(duplicate || null);
    };
  });
}

/**
 * Lista todos os items da fila
 * @returns {Promise<object[]>}
 */
export async function getAllQueueItems() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readonly');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Limpa fila (para testes ou reset)
 * @returns {Promise<void>}
 */
export async function clearQueue() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORE_QUEUE);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      logger.log('[offlineStorage] Fila limpa');
      resolve();
    };
  });
}

/**
 * Conta items com status específico
 * @param {string} status
 * @returns {Promise<number>}
 */
export async function countQueueItemsByStatus(status) {
  const items = await getQueueItemsByStatus(status);
  return items.length;
}

// ── Conflicts (LWW) ──────────────────────────────────────────────

/**
 * Adiciona um conflito de sincronização ao IndexedDB
 * @param {object} conflict
 * @returns {Promise<string>} id do conflito
 */
export async function addConflict(conflict) {
  const database = await initDB();

  const conflictWithId = {
    ...conflict,
    id: conflict.id || crypto.randomUUID?.() || `conflict-${Date.now()}`,
    createdDate: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CONFLICTS], 'readwrite');
    const store = transaction.objectStore(STORE_CONFLICTS);
    const request = store.add(conflictWithId);

    request.onerror = () => {
      logger.error('[offlineStorage] Erro ao adicionar conflito:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      logger.log('[offlineStorage] Conflito adicionado:', conflictWithId.id);
      resolve(conflictWithId.id);
    };
  });
}

/**
 * Lista todos os conflitos com status específico
 * @param {string} status
 * @returns {Promise<object[]>}
 */
export async function getConflictsByStatus(status) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CONFLICTS], 'readonly');
    const store = transaction.objectStore(STORE_CONFLICTS);
    const index = store.index('status');
    const request = index.getAll(status);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Lista todos os conflitos
 * @returns {Promise<object[]>}
 */
export async function getAllConflicts() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CONFLICTS], 'readonly');
    const store = transaction.objectStore(STORE_CONFLICTS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Obtém um conflito por ID
 * @param {string} conflictId
 * @returns {Promise<object|null>}
 */
export async function getConflict(conflictId) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CONFLICTS], 'readonly');
    const store = transaction.objectStore(STORE_CONFLICTS);
    const request = store.get(conflictId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Remove um conflito
 * @param {string} conflictId
 * @returns {Promise<void>}
 */
export async function removeConflict(conflictId) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CONFLICTS], 'readwrite');
    const store = transaction.objectStore(STORE_CONFLICTS);
    const request = store.delete(conflictId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      logger.log('[offlineStorage] Conflito removido:', conflictId);
      resolve();
    };
  });
}

/**
 * Conta conflitos com status específico
 * @param {string} status
 * @returns {Promise<number>}
 */
export async function countConflictsByStatus(status) {
  const items = await getConflictsByStatus(status);
  return items.length;
}

/**
 * Limpa todos os conflitos
 * @returns {Promise<void>}
 */
export async function clearConflicts() {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_CONFLICTS], 'readwrite');
    const store = transaction.objectStore(STORE_CONFLICTS);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      logger.log('[offlineStorage] Conflitos limpos');
      resolve();
    };
  });
}

// ── Data Cache (offline reading) ────────────────────────────────

/**
 * Salva dados no cache de leitura (offline viewing).
 * @param {string} cacheKey - chave única (ex: 'records:list', 'auxData:regionais+users')
 * @param {any} data - dados a cachear
 * @param {string} category - categoria para limpeza seletiva ('records' | 'auxData')
 * @returns {Promise<void>}
 */
export async function saveDataCache(cacheKey, data, category = 'records') {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DATA_CACHE], 'readwrite');
    const store = transaction.objectStore(STORE_DATA_CACHE);
    const request = store.put({
      cacheKey,
      category,
      data,
      cachedAt: Date.now(),
    });

    request.onerror = () => {
      logger.error('[offlineStorage] Erro ao salvar cache:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Recupera dados do cache de leitura.
 * @param {string} cacheKey
 * @returns {Promise<{data: any, cachedAt: number} | null>}
 */
export async function getDataCache(cacheKey) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DATA_CACHE], 'readonly');
    const store = transaction.objectStore(STORE_DATA_CACHE);
    const request = store.get(cacheKey);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result || null;
      resolve(result ? { data: result.data, cachedAt: result.cachedAt } : null);
    };
  });
}

/**
 * Limpa todo o cache de dados de leitura, ou apenas uma categoria.
 * @param {string} [category] - se fornecido, limpa apenas essa categoria
 * @returns {Promise<void>}
 */
export async function clearDataCache(category = null) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DATA_CACHE], 'readwrite');
    const store = transaction.objectStore(STORE_DATA_CACHE);

    if (!category) {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
      return;
    }

    const index = store.index('category');
    const request = index.openCursor(IDBKeyRange.only(category));
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    transaction.oncomplete = () => resolve();
  });
}

// ── Offline Photos (upload pendente) ─────────────────────────────

/**
 * Salva uma foto offline (base64) para upload quando a conexão voltar.
 * @param {object} photo - { photoId, base64, fileName, status: 'pending' }
 * @returns {Promise<void>}
 */
export async function addOfflinePhoto(photo) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_PHOTOS], 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    const request = store.put({
      photoId: photo.photoId,
      base64: photo.base64,
      fileName: photo.fileName,
      mimeType: photo.mimeType || null,
      status: photo.status || 'pending',
      uploadedUrl: null,
      createdAt: Date.now(),
    });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Obtém uma foto offline pelo ID.
 * @param {string} photoId
 * @returns {Promise<object|null>}
 */
export async function getOfflinePhoto(photoId) {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_PHOTOS], 'readonly');
    const store = tx.objectStore(STORE_PHOTOS);
    const request = store.get(photoId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * Lista todas as fotos pendentes de upload.
 * @returns {Promise<object[]>}
 */
export async function getPendingPhotos() {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_PHOTOS], 'readonly');
    const store = tx.objectStore(STORE_PHOTOS);
    const index = store.index('status');
    const request = index.getAll('pending');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Atualiza o status de uma foto (ex: marcar como uploaded com a URL real).
 * @param {string} photoId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export async function updateOfflinePhoto(photoId, updates) {
  const database = await initDB();
  const existing = await getOfflinePhoto(photoId);
  if (!existing) return;
  return new Promise((resolve, reject) => {
    const tx = database.transaction([STORE_PHOTOS], 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    const request = store.put({ ...existing, ...updates });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Conta fotos pendentes de upload.
 * @returns {Promise<number>}
 */
export async function countPendingPhotos() {
  const photos = await getPendingPhotos();
  return photos.length;
}