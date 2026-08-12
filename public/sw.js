// PWA service worker for B1Admin.
// Bump CACHE_VERSION on every production build to force a fresh static cache.
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `b1admin-static-${CACHE_VERSION}`;

const STATIC_ASSET_RE = /\.(?:js|css|png|jpg|jpeg|svg|webp|woff|woff2|ttf|otf|eot|json|ico)$/i;

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => console.error('[SW] Precache failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache the service worker itself or cross-origin/API calls.
  if (url.pathname === '/sw.js') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api')) return;

  // Static assets: cache-first with background refresh.
  if (STATIC_ASSET_RE.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Navigation / HTML: network-first, fallback to cached shell.
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // Everything else: network-first, fallback cache.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
