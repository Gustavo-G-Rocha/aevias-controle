/**
 * useOfflineSync.js
 * Hook que gerencia sincronização automática quando conexão volta.
 * Expõe contadores de pendências, falhas e conflitos (LWW).
 */

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOfflineDetection } from './useOfflineDetection';
import { syncPendingItems, resolveConflict as resolveConflictService } from '@/services/syncService';
import {
  getQueueItemsByStatus,
  countQueueItemsByStatus,
  getAllConflicts,
  countConflictsByStatus,
} from '@/services/offlineStorageService';
import { logger } from '@/utils/logger';

/**
 * Hook que sincroniza items pendentes automaticamente quando online
 * @returns {object}
 */
export function useOfflineSync() {
  const { isOnline } = useOfflineDetection();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [conflicts, setConflicts] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [lastError, setLastError] = useState(null);

  // Atualizar contadores de pendência e conflitos
  const refreshCounts = useCallback(async () => {
    try {
      const pending = await countQueueItemsByStatus('pending');
      const failed = await countQueueItemsByStatus('failed');
      const conflict = await countConflictsByStatus('pending');
      const allConflicts = await getAllConflicts();
      setPendingCount(pending);
      setFailedCount(failed);
      setConflictCount(conflict);
      setConflicts(allConflicts);
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
        // Invalidar cache do React Query para a UI buscar os registros sincronizados
        queryClient.invalidateQueries({ queryKey: ['allRecords'] });
        queryClient.invalidateQueries({ queryKey: ['auxData'] });
        queryClient.invalidateQueries({ queryKey: ['supervisorRecords'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }

      if (result.failed > 0) {
        const errorMsg = `${result.failed} items falharam: ${result.errors.join('; ')}`;
        logger.warn('[useOfflineSync]', errorMsg);
        setLastError(errorMsg);
      }

      await refreshCounts();
    } catch (e) {
      logger.error('[useOfflineSync] Erro durante sincronização:', e);
      setLastError(e?.message || String(e));
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshCounts, queryClient]);

  // Resolver conflito (force overwrite ou discard)
  const resolveConflict = useCallback(async (conflict, resolution) => {
    try {
      const result = await resolveConflictService(conflict, resolution);
      if (result.success) {
        logger.log('[useOfflineSync] Conflito resolvido:', conflict.id, resolution);
      } else {
        logger.error('[useOfflineSync] Erro ao resolver conflito:', result.error);
      }
      await refreshCounts();
      return result;
    } catch (e) {
      logger.error('[useOfflineSync] Erro ao resolver conflito:', e);
      return { success: false, error: e?.message || String(e) };
    }
  }, [refreshCounts]);

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    if (!isOnline) return;

    performSync();

    const interval = setInterval(performSync, 30000);

    return () => clearInterval(interval);
  }, [isOnline, performSync]);

  // Carregamento inicial de contadores
  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  // Atualizar contadores quando um novo item é enfileirado offline
  useEffect(() => {
    const handler = () => refreshCounts();
    window.addEventListener('offline-queue-updated', handler);
    return () => window.removeEventListener('offline-queue-updated', handler);
  }, [refreshCounts]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    failedCount,
    conflictCount,
    conflicts,
    lastSyncTime,
    lastError,
    performSync,
    resolveConflict,
    refreshCounts,
  };
}