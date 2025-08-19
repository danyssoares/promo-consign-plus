// Service worker para PromoConsign Plus

const CACHE_NAME = 'promo-consign-plus-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Força a ativação imediata do novo service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Estratégia: Network First para API calls, Cache First para assets estáticos
  if (event.request.url.includes('/api/') || event.request.url.includes('azfinisdev.biz')) {
    // Para APIs, sempre tenta network first
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Para assets estáticos, usa cache com fallback para network
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            // Se tem no cache, verifica se é muito antigo (mais de 1 hora)
            const cacheDate = response.headers.get('date');
            if (cacheDate) {
              const age = Date.now() - new Date(cacheDate).getTime();
              if (age > 3600000) { // 1 hora em ms
                return fetch(event.request).catch(() => response);
              }
            }
            return response;
          }
          return fetch(event.request);
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