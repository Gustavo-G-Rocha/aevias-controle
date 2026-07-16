/**
 * useOfflineDetection.js
 * Hook para detectar online/offline usando navigator.onLine e
 * simulação manual (offlineSimulation).
 */

import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { isEffectivelyOffline } from '@/utils/offlineSimulation';

/**
 * Hook que monitora conexão online/offline
 * @returns {object} { isOnline: boolean }
 */
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR fallback
    return !isEffectivelyOffline();
  });

  useEffect(() => {
    const compute = () => {
      const online = !isEffectivelyOffline();
      logger.log(`[useOfflineDetection] ${online ? 'Online' : 'Offline'}`);
      setIsOnline(online);
    };

    const handleOnline = () => compute();
    const handleOffline = () => compute();

    // Recalcula imediatamente para capturar mudanças de simulação
    compute();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}