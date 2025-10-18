/**
 * Enhanced Service Worker for Jahannuma
 * Implements caching strategies for better Core Web Vitals and offline support
 */

const CACHE_NAME = 'jahannuma-v1';
const STATIC_CACHE = 'jahannuma-static-v1';
const DYNAMIC_CACHE = 'jahannuma-dynamic-v1';
const IMAGE_CACHE = 'jahannuma-images-v1';
const API_CACHE = 'jahannuma-api-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/globals.css',
  '/Mehr_Nastaliq.ttf',
  '/logo.png',
  '/manifest.json',
  '/favicon/favicon-32x32.png',
  '/favicon/favicon-16x16.png',
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/airtable/ashaar',
  '/api/airtable/ghazlen',
  '/api/airtable/nazmen',
  '/api/airtable/rubai',
  '/api/airtable/ebooks',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isImage(url)) {
    event.respondWith(handleImage(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(url)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Check if request is for static asset
function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|woff2?|ttf|png|jpg|jpeg|gif|svg|ico)$/);
}

// Check if request is for image
function isImage(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/);
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

// Check if request is for page
function isPageRequest(url) {
  return url.pathname.startsWith('/') && !isStaticAsset(url) && !isAPIRequest(url);
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Static asset fetch failed:', error);
    return new Response('Asset not available', { status: 404 });
  }
}

// Handle images with cache-first strategy and compression
async function handleImage(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache images for longer periods
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Image fetch failed:', error);
    // Return placeholder image
    return new Response('', { status: 404 });
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(API_CACHE);
    
    // Try network first
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful API responses for short periods
        const responseToCache = networkResponse.clone();
        cache.put(request, responseToCache);
        
        // Set cache expiration (5 minutes for API responses)
        setTimeout(() => {
          cache.delete(request);
        }, 5 * 60 * 1000);
      }
      
      return networkResponse;
    } catch (networkError) {
      // Network failed, try cache
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        console.log('Serving API response from cache');
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('API request failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Network unavailable', 
      records: [] 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle page requests with stale-while-revalidate strategy
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Serve from cache immediately if available
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch(() => {
      // Network failed, return cached version if available
      return cachedResponse;
    });
    
    // Return cached version immediately, update in background
    if (cachedResponse) {
      fetchPromise.catch(() => {}); // Ignore errors for background update
      return cachedResponse;
    }
    
    // No cached version, wait for network
    return fetchPromise;
  } catch (error) {
    console.error('Page request failed:', error);
    return new Response('Page not available offline', { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Background sync triggered');
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/favicon/android-chrome-192x192.png',
      badge: '/favicon/favicon-32x32.png',
      data: data.url,
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Periodic background sync for cache updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-update') {
    event.waitUntil(updateCaches());
  }
});

async function updateCaches() {
  try {
    // Update critical resources
    const cache = await caches.open(STATIC_CACHE);
    
    for (const asset of STATIC_ASSETS) {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
        }
      } catch (error) {
        console.warn(`Failed to update cache for ${asset}:`, error);
      }
    }
    
    console.log('Cache updated successfully');
  } catch (error) {
    console.error('Cache update failed:', error);
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
      case 'UPDATE_CACHE':
        updateCaches();
        break;
    }
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('All caches cleared');
}