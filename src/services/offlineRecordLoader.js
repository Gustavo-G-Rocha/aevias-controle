// offlineRecordLoader.js — Carregamento de registro individual tolerante a offline.
// Quando online: busca direto no servidor (base44.entities.get).
// Quando offline (ou rede instável): cai para o cache de registros em IndexedDB,
// procurando o registro pelo id dentro da lista cacheada.
//
// Isso permite abrir/edição de registros já carregados anteriormente mesmo sem rede,
// eliminando o erro "Não foi possível carregar os dados" ao entrar offline.

import { base44 } from '@/api/base44Client';
import { getDataCache } from '@/services/offlineStorageService';
import { isOffline } from '@/services/offlinePhotoService';
import { logger } from '@/utils/logger';

// Chaves de cache de registros gravadas por useQueryData/useAllRecords.
const RECORD_CACHE_KEYS = ['records:list', 'records:dashboard'];

/**
 * Obtém um registro por id, com fallback offline para o cache de registros.
 * @param {string} entityName — nome da entidade (ex: 'DiarioObra', 'EnsaioCAUQ')
 * @param {string} id — id do registro
 * @returns {Promise<object>} registro (sem o campo auxiliar entityType)
 */
export async function obterRegistroOfflineAware(entityName, id) {
  // Online: tenta o servidor primeiro.
  if (!isOffline()) {
    try {
      return await base44.entities[entityName].get(id);
    } catch (err) {
      // Rede instável ou servidor indisponível — tenta o cache antes de falhar.
      logger.warn(`[offlineRecordLoader] get online falhou (${entityName}/${id}), tentando cache:`, err?.message);
    }
  }

  // Offline (ou falha online): procura no cache de registros em IndexedDB.
  for (const cacheKey of RECORD_CACHE_KEYS) {
    try {
      const cached = await getDataCache(cacheKey);
      if (cached?.data && Array.isArray(cached.data)) {
        const found = cached.data.find(
          r => r.id === id && (r.entityType === entityName || !r.entityType)
        );
        if (found) {
          // Remove o campo auxiliar entityType adicionado pelo normalizeRecords.
          const { entityType, ...rest } = found;
          return rest;
        }
      }
    } catch (e) {
      // ignora erro de leitura de cache e tenta próxima chave
    }
  }

  throw new Error('Registro não disponível offline. Conecte-se à internet e tente novamente.');
}