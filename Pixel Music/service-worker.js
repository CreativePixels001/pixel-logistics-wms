// Service Worker for Pixel Music
// Handles background audio and provides offline capabilities

const CACHE_NAME = 'pixel-music-v1.3.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/auth.js',
    '/config.js',
    '/radio.html',
    '/radio.css',
    '/radio.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
                    .catch(err => {
                        console.error('[Service Worker] Failed to cache:', err);
                        // Continue even if some resources fail to cache
                    });
            })
    );
    self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch Strategy: Network First, fallback to Cache
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip Chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;
    
    // Skip YouTube API and external API requests (always need fresh data)
    if (event.request.url.includes('googleapis.com') || 
        event.request.url.includes('lyrics.ovh') ||
        event.request.url.includes('accounts.google.com') ||
        event.request.url.includes('radio-browser.info')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response
                const responseToCache = response.clone();
                
                // Cache the fetched response
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            console.log('[Service Worker] Serving from cache:', event.request.url);
                            return response;
                        }
                        
                        // Return a custom offline page if needed
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Handle background sync (for future features)
self.addEventListener('sync', event => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-playlists') {
        // Future: Sync playlists when back online
    }
});

// Handle push notifications (for future features)
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/icon.png',
        badge: '/badge.png'
    };
    
    event.waitUntil(
        self.registration.showNotification('Pixel Music', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked');
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message handler for communication with main app
self.addEventListener('message', event => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[Service Worker] Loaded successfully');
