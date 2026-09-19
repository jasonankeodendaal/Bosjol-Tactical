const CACHE_VERSION = 'v6';
const STATIC_CACHE_NAME = `bosjol-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `bosjol-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `bosjol-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/icon.svg',
  '/screenshots/desktop-suite-1280x720.png',
  '/screenshots/desktop-dashboard-1280x720.png',
  '/screenshots/player-dashboard-720x1280.png',
  '/screenshots/events-view-720x1280.png',
  '/screenshots/leaderboard-720x1280.png',
  '/screenshots/mobile-overview-720x1280.png',
  '/shortcuts/events-96x96.png',
  '/shortcuts/events-192x192.png',
  '/shortcuts/leaderboard-96x96.png',
  '/shortcuts/leaderboard-192x192.png',
  '/shortcuts/stats-96x96.png',
  '/shortcuts/stats-192x192.png',
  '/shortcuts/rules-96x96.png',
  '/shortcuts/rules-192x192.png',
  'https://www.toptal.com/designers/subtlepatterns/uploads/dark-geometric.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap'
];

// INSTALL: Cache essential static shell assets and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async cache => {
      console.log('[SW] Precaching App Shell');
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (err) {
        console.warn('[SW] Non-critical precache failure on some assets:', err);
      }
    })
  );
});

// ACTIVATE: Purge outdated caches and claim existing clients
self.addEventListener('activate', event => {
  const allowedCaches = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!allowedCaches.includes(cacheName)) {
            console.log('[SW] Deleting stale cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Smart caching strategy (Stale-while-revalidate for static/images, network-first for navigation)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // Handle SPA navigation requests: Network first, falling back to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexCached = await caches.match('/index.html') || await caches.match('/');
          return indexCached || Response.error();
        })
    );
    return;
  }

  // Handle static assets & images (Cache-first with background network update)
  const isImage = request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i);
  const isFontOrScript = url.hostname.includes('fonts.') || url.hostname.includes('cdn.') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isImage || isFontOrScript) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        const fetchPromise = fetch(request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            const targetCache = isImage ? IMAGE_CACHE_NAME : DYNAMIC_CACHE_NAME;
            caches.open(targetCache).then(cache => cache.put(request, copy));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Standard runtime requests: Network first falling back to cache
  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('Offline: Content unavailable without network connection.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

// MESSAGE: Allow clients to manually trigger skipWaiting or request rich notifications
self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      body: options?.body || 'Tactical alert notification',
      icon: options?.icon || '/pwa-192x192.png',
      badge: options?.badge || '/pwa-192x192.png',
      image: options?.image,
      tag: options?.tag || `bosjol-alert-${Date.now()}`,
      renotify: options?.renotify !== undefined ? options.renotify : true,
      requireInteraction: options?.requireInteraction || false,
      vibrate: options?.vibrate || [200, 100, 200, 100, 200],
      actions: options?.actions || [
        { action: 'open', title: 'View Ops' },
        { action: 'close', title: 'Dismiss' }
      ],
      data: {
        url: options?.data?.url || '/',
        dateOfArrival: Date.now(),
        ...(options?.data || {})
      }
    };
    event.waitUntil(
      self.registration.showNotification(title || 'Bosjol Tactical Alert', notificationOptions)
    );
  }
});

// BACKGROUND SYNC: Resync when connectivity is restored
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  if (event.tag === 'sync-tactical-data') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGERED' });
        });
      })
    );
  }
});

// PUSH NOTIFICATIONS: Handle incoming push notifications for mobile devices
self.addEventListener('push', event => {
  let data = { 
    title: 'Bosjol Tactical Alert', 
    body: 'New tactical updates or event reminders are available.',
    url: '/',
    tag: 'bosjol-push'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    image: data.image,
    tag: data.tag || 'bosjol-tactical-notification',
    renotify: true,
    vibrate: data.vibrate || [200, 100, 200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'View Alert' },
      { action: 'close', title: 'Dismiss' }
    ],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      ...data.data
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Bosjol Tactical Alert', options)
  );
});

// NOTIFICATION CLICK: Handle notification clicks & mobile deep-links
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification?.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if there is already a window open with this URL
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl) || targetUrl === '/') {
            client.postMessage({
              type: 'NAVIGATE_TO',
              url: targetUrl,
              notificationData: event.notification.data
            });
            return client.focus();
          }
        }
      }
      // If no matching window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', event => {
  console.log('[SW] Notification dismissed:', event.notification.tag);
});