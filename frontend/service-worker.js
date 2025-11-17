/**
 * DLT WMS Service Worker
 * Provides offline capabilities and caching for Progressive Web App
 * Version: 1.0.0
 */

const CACHE_VERSION = 'dlt-wms-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Cache size limits
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 100;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/notifications.css',
  '/css/enhanced-table.css',
  '/css/scanner-qr.css',
  '/css/mobile-scanner.css',
  '/css/advanced-analytics.css',
  '/js/theme.js',
  '/js/notifications.js',
  '/js/barcode-scanner.js',
  '/js/qr-generator.js',
  '/js/scan-integration.js',
  '/js/mobile-scanner.js',
  '/js/advanced-analytics.js',
  '/manifest.json'
];

// Pages to cache for offline access
const OFFLINE_PAGES = [
  '/index.html',
  '/receiving.html',
  '/picking.html',
  '/packing.html',
  '/shipping.html',
  '/inventory.html',
  '/cycle-count.html',
  '/mobile-receiving.html',
  '/mobile-picking.html',
  '/mobile-count.html'
];

// Fallback offline page
const OFFLINE_FALLBACK = '/offline.html';

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return caches.open(DYNAMIC_CACHE);
      })
      .then((cache) => {
        console.log('[Service Worker] Caching offline pages');
        return cache.addAll(OFFLINE_PAGES);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName.startsWith('dlt-wms-') && cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch Event - Serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different request types
  if (request.method !== 'GET') {
    // Don't cache non-GET requests
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          updateCache(request);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Cache the response
            return cacheResponse(request, networkResponse.clone())
              .then(() => networkResponse);
          })
          .catch(() => {
            // Network failed, try offline fallback
            return handleOfflineFallback(request);
          });
      })
      .catch(() => {
        // Cache match failed, try network
        return fetch(request)
          .catch(() => handleOfflineFallback(request));
      })
  );
});

/**
 * Update cache in background (stale-while-revalidate)
 */
function updateCache(request) {
  return fetch(request)
    .then((response) => {
      return cacheResponse(request, response);
    })
    .catch(() => {
      // Ignore errors in background update
    });
}

/**
 * Cache a response based on type
 */
function cacheResponse(request, response) {
  // Only cache successful responses
  if (!response || response.status !== 200) {
    return Promise.resolve();
  }

  const url = new URL(request.url);
  const ext = url.pathname.split('.').pop().toLowerCase();

  // Determine cache based on file type
  let cacheName;
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
    cacheName = IMAGE_CACHE;
  } else if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    cacheName = STATIC_CACHE;
  } else {
    cacheName = DYNAMIC_CACHE;
  }

  return caches.open(cacheName)
    .then((cache) => {
      return cache.put(request, response);
    })
    .then(() => {
      // Limit cache size
      return limitCacheSize(cacheName, cacheName === IMAGE_CACHE ? MAX_IMAGE_CACHE_SIZE : MAX_DYNAMIC_CACHE_SIZE);
    });
}

/**
 * Limit cache size by removing oldest entries
 */
function limitCacheSize(cacheName, maxSize) {
  return caches.open(cacheName)
    .then((cache) => {
      return cache.keys()
        .then((keys) => {
          if (keys.length > maxSize) {
            console.log(`[Service Worker] Limiting ${cacheName} size`);
            return cache.delete(keys[0])
              .then(() => limitCacheSize(cacheName, maxSize));
          }
        });
    });
}

/**
 * Handle offline fallback
 */
function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return offline fallback
  if (request.headers.get('accept').includes('text/html')) {
    return caches.match(OFFLINE_FALLBACK)
      .then((response) => {
        if (response) {
          return response;
        }
        // If no offline page, return basic offline message
        return new Response(
          '<html><body><h1>Offline</h1><p>You are currently offline. Please check your connection.</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      });
  }

  // For other resources, return empty response
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}

/**
 * Background Sync Event
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sync offline data when connection is restored
 */
function syncOfflineData() {
  console.log('[Service Worker] Syncing offline data...');
  
  // Notify all clients to sync their offline queues
  return self.clients.matchAll()
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_OFFLINE_DATA',
          timestamp: Date.now()
        });
      });
    });
}

/**
 * Push Notification Event (for Phase 11B)
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('DLT WMS', options)
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

/**
 * Message Event - Communication with clients
 */
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => Promise.all(
          cacheNames.map((name) => caches.delete(name))
        ))
    );
  }
});

/**
 * Push Event - Handle incoming push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'DLT WMS Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200]
  };

  // Parse push data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || data.message || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        vibrate: data.vibrate || notificationData.vibrate,
        data: data.data || {},
        actions: data.actions || []
      };
    } catch (e) {
      // If not JSON, use text
      notificationData.body = event.data.text();
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions
    })
  );
});

/**
 * Notification Click - Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action;

  // Handle notification actions
  if (action === 'start' || action === 'receive') {
    // Open appropriate page based on notification type
    let targetUrl = '/';
    
    if (notificationData.type === 'cycle_count_due') {
      targetUrl = '/cycle-count.html';
    } else if (notificationData.type === 'receiving_alert') {
      targetUrl = '/receiving.html';
    } else if (notificationData.type === 'task_assigned') {
      targetUrl = '/index.html';
    } else if (notificationData.type === 'shipment_ready') {
      targetUrl = '/shipping.html';
    } else if (notificationData.type === 'low_stock') {
      targetUrl = '/inventory.html';
    }

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(targetUrl) && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if not already open
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
    );
  } else if (action === 'snooze') {
    // Re-schedule notification for later (would typically use server-side scheduling)
    console.log('[Service Worker] Notification snoozed');
  } else if (action === 'dismiss') {
    // Just close notification (already done above)
    console.log('[Service Worker] Notification dismissed');
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          if (clientList.length > 0) {
            return clientList[0].focus();
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

/**
 * Background Sync - Sync offline data when connection is restored
 */
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);

  if (event.tag === 'sync-offline-data') {
    event.waitUntil(
      // Notify the app to sync offline data
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          clientList.forEach((client) => {
            client.postMessage({
              type: 'BACKGROUND_SYNC',
              tag: event.tag
            });
          });
        })
        .then(() => {
          console.log('[Service Worker] Sync completed');
        })
        .catch((error) => {
          console.error('[Service Worker] Sync failed:', error);
          throw error; // Will retry sync
        })
    );
  }
});

console.log('[Service Worker] Script loaded', CACHE_VERSION);
