const STATIC_CACHE_NAME = 'bosjol-static-cache-v2';
const DYNAMIC_CACHE_NAME = 'bosjol-dynamic-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://www.toptal.com/designers/subtlepatterns/uploads/dark-geometric.png',
  '/manifest.json',
  'https://i.ibb.co/HL2Lc6Rz/file-0000000043b061f7b655a0077343e063.png',
  'https://i.ibb.co/v6qtDrT4/maskable-icon.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap'
  // Note: CDN resources used in importmap are harder to pre-cache reliably,
  // but they will be cached on first use by the fetch handler.
];

// INSTALL: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching App Shell');
      // Use cache.addAll() for an atomic operation.
      // It fetches and caches in one step. If any file fails, the whole operation fails.
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
        console.error('Service Worker: App Shell caching failed', error);
    })
  );
});

// ACTIVATE: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// FETCH: Network-first strategy with no offline fallback.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the network request is successful, cache the response for potential future performance improvements during ONLINE sessions.
        // This does not provide an offline fallback.
        const responseToCache = networkResponse.clone();
        
        // Decide which cache to use.
        const url = new URL(event.request.url);
        // A simple way to check if it's a static asset from our predefined list.
        // We check both full URL and just pathname for flexibility.
        const isStaticAsset = STATIC_ASSETS.includes(url.href) || STATIC_ASSETS.includes(url.pathname);
        const cacheName = isStaticAsset ? STATIC_CACHE_NAME : DYNAMIC_CACHE_NAME;

        // Only cache successful GET requests.
        if (networkResponse.ok && event.request.method === 'GET') {
          caches.open(cacheName).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return networkResponse;
      })
      // By omitting the .catch() block that would serve from cache,
      // any network failure will result in the browser's default offline error page.
      // This satisfies the "no offline" requirement.
  );
});