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
  
  // Only handle GET requests for same-origin static assets
  const isStaticAsset = 
    url.hostname === location.hostname &&
    (url.pathname.startsWith('/_next/static/') ||
     url.pathname.startsWith('/public/') ||
     url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|json|txt)$/) ||
     url.pathname === '/favicon.ico' ||
     url.pathname === '/manifest.json');

  if (!isStaticAsset) return;

  // Stale-while-revalidate for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request.clone()).then(
        (response) => {
          if (response && response.status === 200) {
            const responseForCache = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, responseForCache));
          }
          return response;
        }
      );
      return cached || fetchPromise;
    })
    .catch(() => {
      return Promise.reject();
    })
  );
});
