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

// INSTALL: Cache static assets and take control immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
        console.error('Service Worker: App Shell caching failed', error);
    })
  );
});

// ACTIVATE: Clean up old caches and claim clients
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
          return null;
        })
      );
    }).then(() => self.clients.claim()) // This makes the SW take control of pages immediately
  );
});


// FETCH: Network falling back to cache strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Try to fetch from the network
    fetch(event.request)
      .then(networkResponse => {
        // 2a. If network is successful, cache the response and return it
        const responseToCache = networkResponse.clone();
        
        // Only cache successful GET requests. We'll use the dynamic cache for all runtime requests.
        if (networkResponse.ok && event.request.method === 'GET') {
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return networkResponse;
      })
      .catch(() => {
        // 2b. If network fails, try to serve from the cache
        return caches.match(event.request).then(cachedResponse => {
          // If a cached response is found, return it.
          if (cachedResponse) {
            return cachedResponse;
          }

          // For page navigation requests that are not in the cache (e.g., a direct link to a sub-page),
          // fall back to the main index.html file. This is crucial for SPAs.
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }

          // If no cache match is found for other types of requests (like API calls),
          // the promise will resolve to undefined, and the browser will handle the network error.
          return;
        });
      })
  );
});