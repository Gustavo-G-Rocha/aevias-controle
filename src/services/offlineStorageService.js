/**
 * offlineStorageService.js
 * Gerencia IndexedDB para armazenamento offline
 * Store: queueItems (fila de sincronização)
 */

const DB_NAME = 'aevias-offline-v1';
const STORE_QUEUE = 'queueItems';
const DB_VERSION = 1;

let db = null;

/**
 * Inicializa o banco de dados IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
  if (db) return db;

  // Guard para ambiente de teste (sem indexedDB)
  if (typeof indexedDB === 'undefined') {
    throw new Error('[offlineStorage] IndexedDB não disponível neste ambiente');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[offlineStorage] Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('[offlineStorage] IndexedDB inicializado');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Criar store para fila de sincronização
      if (!database.objectStoreNames.contains(STORE_QUEUE)) {
        const store = database.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('entityType', 'entityType', { unique: false });
        store.createIndex('dataHash', 'dataHash', { unique: false });
        console.log('[offlineStorage] Store criado:', STORE_QUEUE);
      }
    };
  });
}

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
      console.error('[offlineStorage] Erro ao adicionar item:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[offlineStorage] Item adicionado:', item.id);
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
      console.log('[offlineStorage] Item atualizado:', itemId);
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
      console.log('[offlineStorage] Item removido:', itemId);
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
      console.log('[offlineStorage] Fila limpa');
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