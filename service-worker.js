const STATIC_CACHE_NAME = 'bosjol-static-cache-v2';
const DYNAMIC_CACHE_NAME = 'bosjol-dynamic-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://www.toptal.com/designers/subtlepatterns/uploads/dark-geometric.png',
  'manifest.json',
  'https://i.ibb.co/HL2Lc6Rz/file-0000000043b061f7b655a0077343e063.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap'
  // Note: CDN resources used in importmap are harder to pre-cache reliably,
  // but they will be cached on first use by the fetch handler.
];

const API_HOSTS = ['firestore.googleapis.com', 'identitytoolkit.googleapis.com'];

// INSTALL: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching App Shell');
      // Use addAll for atomic operation. Use { cache: 'reload' } to bypass browser cache.
      return Promise.all(
        STATIC_ASSETS.map(url =>
          fetch(new Request(url, { cache: 'reload' }))
            .then(response => cache.put(url, response))
            .catch(err => console.warn(`Failed to cache ${url}: ${err}`))
        )
      );
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

// FETCH: Intercept network requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Strategy 1: Network Falling Back to Cache (for APIs and CDN scripts)
  // This ensures data is as fresh as possible, but provides an offline fallback.
  if (API_HOSTS.includes(url.hostname) || url.hostname.includes('aistudiocdn.com') || url.hostname.includes('gstatic.com') && !url.pathname.includes('googleapis')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        return fetch(event.request).then(networkResponse => {
          // If we get a valid response, cache it and return it
          // Only cache successful GET requests
          if(networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If the network fails, try to serve from the cache
          return cache.match(event.request);
        });
      })
    );
  } 
  // Strategy 2: Cache First, then Network (for static app shell assets)
  // This is fast and reliable for assets that don't change often.
  else {
     event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                 // Also cache assets that might have been missed in the install step, like fonts or images
                return caches.open(STATIC_CACHE_NAME).then(cache => {
                    if(networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                })
            });
        })
    );
  }
});