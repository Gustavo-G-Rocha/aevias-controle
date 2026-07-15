import { lazy } from 'react';

const RETRY_KEY = 'aevias-lazy-reload';

async function clearCodeCaches() {
  if (!('caches' in window)) return;
  const keys = await window.caches.keys();
  await Promise.all(keys.map((key) => window.caches.delete(key)));
}

export function lazyPage(importer) {
  return lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(RETRY_KEY);
      return module;
    } catch (error) {
      if (typeof window === 'undefined' || sessionStorage.getItem(RETRY_KEY)) {
        sessionStorage.removeItem(RETRY_KEY);
        throw error;
      }

      sessionStorage.setItem(RETRY_KEY, '1');
      await clearCodeCaches();
      window.location.reload();
      return new Promise(() => {});
    }
  });
}