// ServiceWorker V2
// Made by @SatyamV7 <github.com/SatyamV7>
// Licnsed under Apache Licnse V2
// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'Static_Cache v10.0.0-ProductionBuild';
const RUNTIME = 'Dynamic_Cache v10.0.0-ProductionBuild';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/src/js/main.js',
    '/src/js/chess.js',
    '/src/css/main.css',
    '/lib/jquery/jquery-3.5.1.js',
    '/lib/darkmodejs/DarkMode-v1.0.0.js',
    '/lib/chessboardjs/chessboard-1.0.0.min.js',
    '/lib/chessboardjs/chessboard-1.0.0.min.css',
    '/lib/bootstrap/js/bootstrap.bundle.min.js',
    '/lib/bootstrap/css/bootstrap.min.css',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    console.log('service worker has been installed');
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    console.log('service worker has been activated');
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
    console.log('fetch event');
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return caches.open(RUNTIME).then(cache => {
                    return fetch(event.request).then(response => {
                        // Put a copy of the response in the runtime cache.
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    }
});