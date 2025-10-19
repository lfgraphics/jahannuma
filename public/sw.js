const CACHE_NAME = "jahannuma-v2";
const STATIC_CACHE = "jahannuma-static-v2";
const DYNAMIC_CACHE = "jahannuma-dynamic-v2";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/logo.png",
  "/logo_text.png",
  "/Mehr_Nastaliq.ttf",
  "/favicon/android-icon-192x192.png",
  "/favicon/apple-icon-180x180.png",
  "/favicon/favicon-32x32.png",
  "/favicon/favicon-96x96.png",
  "/icons/ashaar.png",
  "/icons/ghazlen.png",
  "/icons/nazmen.png",
  "/icons/books.png",
];

// Check if `self` is defined (browser environment) before using it
if (typeof self !== "undefined") {
  // Install event - cache static assets
  self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    event.waitUntil(
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          console.log("Caching static assets");
          return cache.addAll(STATIC_ASSETS);
        })
        .then(() => {
          // Force activation of new service worker
          return self.skipWaiting();
        })
    );
  });

  // Activate event - clean up old caches
  self.addEventListener("activate", (event) => {
    console.log("Service Worker activating...");
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => {
              if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                console.log("Deleting old cache:", cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        })
        .then(() => {
          // Take control of all clients immediately
          return self.clients.claim();
        })
    );
  });

  // Fetch event - network first with cache fallback for immediate updates
  self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    // Network first strategy for HTML pages (immediate updates)
    if (request.headers.get("accept")?.includes("text/html")) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Clone response for caching
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // Fallback to cache if network fails
            return caches.match(request);
          })
      );
      return;
    }

    // Cache first for static assets
    if (STATIC_ASSETS.includes(url.pathname)) {
      event.respondWith(
        caches.match(request).then((response) => {
          return (
            response ||
            fetch(request).then((fetchResponse) => {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
              return fetchResponse;
            })
          );
        })
      );
      return;
    }

    // Stale while revalidate for other resources
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
  });

  // Listen for messages from the main thread
  self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
      self.skipWaiting();
    }
  });
}
