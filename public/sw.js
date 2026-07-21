/*
 * Service Worker — app shell offline.
 *
 * Estratégia:
 *  - Navegações (HTML): NETWORK-FIRST. Sempre busca a versão mais nova do app
 *    quando há rede; só usa o cache como fallback offline. Isso evita que um
 *    shell antigo em cache quebre rotas novas (ex.: /reset-password abrir na
 *    tela de login em celulares com cache desatualizado).
 *  - Assets versionados (/assets/): CACHE-FIRST (nomes com hash nunca mudam).
 *  - Demais GETs same-origin: rede com fallback ao cache.
 */

const CACHE_NAME = 'aevias-shell-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add('/').catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navegações: rede primeiro, cache como fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put('/', response.clone());
          return response;
        } catch {
          const cached = await caches.match('/');
          if (cached) return cached;
          throw new Error('offline');
        }
      })()
    );
    return;
  }

  // Assets com hash: cache primeiro
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      })()
    );
    return;
  }

  // Demais recursos: rede com fallback ao cache
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error('offline');
      }
    })()
  );
});
