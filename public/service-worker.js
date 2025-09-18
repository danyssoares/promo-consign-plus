// Service worker para PromoConsign Plus

const CACHE_NAME = 'promo-consign-plus-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Assets to cache during installation (critical assets only)
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/optimized-logo.png' // Logo principal otimizado
];

self.addEventListener('install', (event) => {
  // Força a ativação imediata do novo service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        // Only cache critical assets during installation
        return cache.addAll(assetsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Estratégia otimizada: Stale-while-revalidate para melhor performance
  if (event.request.url.includes('/api/') || event.request.url.includes('azfinisdev.biz')) {
    // Para APIs, usa Network First com fallback para cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          // Fallback to cache if network fails
          const cachedResponse = await caches.match(event.request);
          return cachedResponse || new Response('Offline', { status: 503 });
        })
    );
  } else {
    // Para assets estáticos, usa Stale-While-Revalidate
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            // Update cache with fresh response
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // If network fails, return cached response if available
            return response;
          });
          
          // Return cached response immediately if available, otherwise wait for network
          return response || fetchPromise;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  // Limpa caches antigos
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});