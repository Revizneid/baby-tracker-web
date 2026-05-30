const CACHE_NAME = 'baby-tracker-v2';
const ASSETS_TO_CACHE = [
  '/favicon.ico',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.mode === 'navigate' || request.redirect === 'manual') return;

  const url = new URL(request.url);
  
  // Network-first for dynamic content
  if (url.pathname.includes('/api/') || url.hostname !== location.hostname) {
    event.respondWith(
      fetch(request.clone(), { redirect: 'follow' })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request.clone(), { redirect: 'follow' }).catch(() => {
        if (request.headers.get('accept')?.includes('text/html')) {
          return new Response('Offline', { status: 503 });
        }
        return Promise.reject();
      });
    })
  );
});
