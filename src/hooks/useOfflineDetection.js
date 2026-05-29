/**
 * useOfflineDetection.js
 * Hook para detectar online/offline usando navigator.onLine
 */

import { useState, useEffect } from 'react';

/**
 * Hook que monitora conexão online/offline
 * @returns {object} { isOnline: boolean }
 */
export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(() => {
    // Inicializar com estado real (pode ser false mesmo que typeof window === 'undefined')
    if (typeof window === 'undefined') return true; // SSR fallback
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('[useOfflineDetection] Online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[useOfflineDetection] Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}