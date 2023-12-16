const CACHE_NAME = 'jahannuma';

// Check if `self` is defined (browser environment) before using it
if (typeof self !== 'undefined') {
    self.addEventListener('install', (event) => {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll([
                    '/',
                    'logo.png',
                    'manifest.json',
                ]);
            })
        );
    });

    self.addEventListener('fetch', (event) => {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    });
}
