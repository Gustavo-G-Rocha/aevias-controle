/**
 * useOfflineSync.js
 * Hook que gerencia sincronização automática quando conexão volta
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfflineDetection } from './useOfflineDetection';
import { syncPendingItems, syncQueueItem } from '@/services/syncService';
import { getQueueItemsByStatus, countQueueItemsByStatus } from '@/services/offlineStorageService';
import { logger } from '@/utils/logger';

/**
 * Hook que sincroniza items pendentes automaticamente quando online
 * @returns {object}
 */
export function useOfflineSync() {
  const { isOnline } = useOfflineDetection();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [lastError, setLastError] = useState(null);

  // Atualizar contadores de pendência
  const refreshCounts = useCallback(async () => {
    try {
      const pending = await countQueueItemsByStatus('pending');
      const failed = await countQueueItemsByStatus('failed');
      setPendingCount(pending);
      setFailedCount(failed);
    } catch (e) {
      logger.error('[useOfflineSync] Erro ao atualizar contadores:', e);
    }
  }, []);

  // Sincronizar items
  const performSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    logger.log('[useOfflineSync] Iniciando sincronização');
    setIsSyncing(true);
    setLastError(null);

    try {
      const result = await syncPendingItems();
      setLastSyncTime(new Date());
      
      if (result.synced > 0) {
        logger.log(`[useOfflineSync] ${result.synced} items sincronizados`);
      }
      
      if (result.failed > 0) {
        const errorMsg = `${result.failed} items falharam: ${result.errors.join('; ')}`;
        logger.warn('[useOfflineSync]', errorMsg);
        setLastError(errorMsg);
      }

      // Atualizar contadores
      await refreshCounts();
    } catch (e) {
      logger.error('[useOfflineSync] Erro durante sincronização:', e);
      setLastError(e?.message || String(e));
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshCounts]);

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    if (!isOnline) return;

    // Sincronizar imediatamente ao conectar
    performSync();

    // Depois, sincronizar periodicamente a cada 30s
    const interval = setInterval(performSync, 30000);

    return () => clearInterval(interval);
  }, [isOnline, performSync]);

  // Carregamento inicial de contadores
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    failedCount,
    lastSyncTime,
    lastError,
    performSync, // Para sincronizar manualmente se necessário
  };
}