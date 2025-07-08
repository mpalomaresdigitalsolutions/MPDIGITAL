const CACHE_VERSION = '1.1.7';
const CACHE_NAMES = {
  static: `static-cache-${CACHE_VERSION}`,
  dynamic: `dynamic-cache-${CACHE_VERSION}`,
  offline: `offline-cache-${CACHE_VERSION}`
};

// Assets to cache with version tracking
const ASSETS_TO_CACHE = {
  core: [
    '/',
    '/index.html',
    '/offline.html',
    '/assets/css/styles.css',
    '/assets/js/blog-display.js'
  ],
  images: [
    '/assets/images/blog/default-blog-image.svg',
    '/assets/images/blog/ppc-trends.jpg',
    '/assets/images/blog/roi-calculation.jpg',
    '/assets/images/blog/google-ads-optimization.jpg'
  ]
};

// Cache assets with improved error handling
async function cacheAssets(cacheName, assets) {
  const cache = await caches.open(cacheName);
  const results = await Promise.allSettled(
    assets.map(async (url) => {
      try {
        await cache.add(url);
        console.log(`Successfully cached: ${url}`);
        return { status: 'fulfilled', url };
      } catch (error) {
        console.warn(`Failed to cache: ${url}`, error);
        return { status: 'rejected', url, error };
      }
    })
  );

  // Log caching results
  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    console.warn(`Failed to cache ${failed.length} assets:`, failed);
  }

  return results;
}
  prefetch: `prefetch-cache-${CACHE_VERSION}`
};

const STATIC_ASSETS = [
    // Core HTML pages
    './index.html',
    './blog.html',
    './offline.html',
    
    // Stylesheets
    './assets/css/styles.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    
    // JavaScript files
    './assets/js/blog-display.js',
    
    // Images
    './assets/images/Logo.svg',
    './assets/favicon.svg',
    './assets/favicon.png',
    './assets/images/blog/default-blog-image.svg?v=1.1.6',
    './assets/images/blog/ppc-trends.jpg',
    './assets/images/blog/roi-calculation.jpg',
    './assets/images/blog/google-ads-optimization.jpg',
    './assets/images/blog/ppc-trends.jpg',
    './assets/images/blog/roi-calculation.jpg',
    './assets/images/blog/google-ads-optimization.jpg',
    
    // Font Awesome assets
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-regular-400.woff2',
    
    // Other assets
    // HTML files
    './index.html',
    './blog.html',
    './offline.html',
    
    // CSS files
    './assets/css/styles.css',
    
    // JavaScript files
    './assets/js/blog-display.js',
    
    // Blog images
    './assets/images/blog/default-blog-image.svg?v=1.1.4',
    './assets/images/blog/ppc-trends.jpg',
    './assets/images/blog/roi-calculation.jpg',
    './assets/images/blog/google-ads-optimization.jpg',
    
    // Other assets
  './',
  './index.html',
  './offline.html',
  './assets/css/styles.css',
  './assets/css/enhanced-styles.css',
  './assets/js/navigation.js',
  './assets/js/enhanced-main.js',
  './assets/js/analytics.js',
  './assets/js/blog-display.js',
  './assets/js/calculator.js',
  './assets/images/Logo.svg',
  './assets/favicon.svg',
  './assets/favicon.png',
  './assets/images/blog/google-ads-optimization.jpg',
  './assets/images/blog/roi-calculation.jpg',
  './assets/images/blog/ppc-trends.jpg',
  './assets/images/blog/default-blog-image.svg',
  './assets/images/blog/default-blog-image.svg?v=1.1.3'
];

// Assets that should be prefetched during idle time
const PREFETCH_ASSETS = [
  './assets/images/hero-banner.jpg',
  './assets/fonts/main-font.woff2'
];

// Cache duration in milliseconds
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Network timeout for fetch requests
const NETWORK_TIMEOUT = 5000;

// Helper function to handle timed fetch requests
const timeoutFetch = (request, timeout = NETWORK_TIMEOUT) => {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
};

// Helper function to determine if a request is an API call
const isApiRequest = (request) => {
  return request.url.includes('/api/') || request.url.includes('/graphql');
};

// Helper function to determine if a response should be cached
const shouldCache = (response) => {
  return response && response.status === 200 && response.type === 'basic';
};

// Install event - cache static assets and prefetch assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      cacheAssets(CACHE_NAMES.static, [...ASSETS_TO_CACHE.core, ...ASSETS_TO_CACHE.images]),
      cacheAssets(CACHE_NAMES.offline, ['/offline.html'])
    ])
    .then(() => {
      console.log('Installation completed successfully');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('Installation failed:', error);
      throw error;
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Check if cache is outdated
              return (
                cacheName.startsWith('static-cache-') ||
                cacheName.startsWith('dynamic-cache-') ||
                cacheName.startsWith('offline-cache-')
              ) && !Object.values(CACHE_NAMES).includes(cacheName);
            })
            .map(cacheName => {
              console.log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
    .then(() => {
      console.log('Service Worker activated and controlling all clients');
    })
    .catch(error => {
      console.error('Activation failed:', error);
      throw error;
    })
  );
});
});

// Fetch event - implement advanced caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Helper function to handle network errors
  const handleNetworkError = async () => {
    const cache = await caches.open(CACHE_NAMES.offline);
    
    // If it's an image request, return the default image
    if (request.headers.get('Accept')?.includes('image')) {
      const defaultImage = await cache.match('/assets/images/blog/default-blog-image.svg');
      if (defaultImage) return defaultImage;
    }
    
    // For HTML requests, return the offline page
    if (request.headers.get('Accept')?.includes('text/html')) {
      return cache.match('/offline.html');
    }
    
    // For other requests, throw a network error
    throw new Error('Network error occurred');
  };

  // Function to log cache hits/misses
  const logCacheStatus = (hit, url) => {
    console.log(`Cache ${hit ? 'HIT' : 'MISS'} for: ${url}`);
  };

  // Main fetch handler with improved caching strategy
  event.respondWith(
    (async () => {
      try {
        // Check cache first
        const cache = await caches.open(CACHE_NAMES.static);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          logCacheStatus(true, url.pathname);
          
          // Revalidate cache in the background
          event.waitUntil(
            (async () => {
              try {
                const networkResponse = await fetch(request);
                await cache.put(request, networkResponse.clone());
                console.log(`Cache updated for: ${url.pathname}`);
              } catch (error) {
                console.warn(`Background sync failed for: ${url.pathname}`, error);
              }
            })()
          );
          
          return cachedResponse;
        }
        
        logCacheStatus(false, url.pathname);
        
        // If not in cache, try network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
          const clonedResponse = networkResponse.clone();
          event.waitUntil(cache.put(request, clonedResponse));
        }
        
        return networkResponse;
      } catch (error) {
        console.error(`Fetch failed for: ${url.pathname}`, error);
        return handleNetworkError();
      }
    })()
  );

  // Handle API requests with network-first strategy and time-based caching
  if (isApiRequest(event.request)) {
    event.respondWith(
      timeoutFetch(event.request)
        .then(response => {
          if (shouldCache(response)) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAMES.dynamic).then(cache => {
              // Add timestamp header for cache duration tracking
              const headers = new Headers(clonedResponse.headers);
              headers.append('sw-fetched-on', new Date().toISOString());
              return cache.put(event.request, new Response(
                clonedResponse.body,
                { ...clonedResponse, headers }
              ));
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              // Check if cached response is still valid
              const fetchedOn = cachedResponse.headers.get('sw-fetched-on');
              if (fetchedOn) {
                const age = new Date().getTime() - new Date(fetchedOn).getTime();
                if (age < API_CACHE_DURATION) {
                  return cachedResponse;
                }
              }
            }
            return cachedResponse || new Response(JSON.stringify({
              error: 'Network error'
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Handle static assets with stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = timeoutFetch(event.request)
        .then(networkResponse => {
          if (shouldCache(networkResponse)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAMES.dynamic).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle service worker messages
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-failed-requests') {
    event.waitUntil(
      // Implement retry logic for failed requests
      Promise.resolve()
    );
  }
});

// Periodic cache cleanup
setInterval(() => {
  Promise.all([
    caches.open(CACHE_NAMES.dynamic),
    caches.open(CACHE_NAMES.prefetch)
  ]).then(([dynamicCache, prefetchCache]) => {
    [dynamicCache, prefetchCache].forEach(cache => {
      cache.keys().then(requests => {
        requests.forEach(request => {
          cache.match(request).then(response => {
            if (response) {
              const fetchedOn = response.headers.get('sw-fetched-on');
              if (fetchedOn) {
                const age = new Date().getTime() - new Date(fetchedOn).getTime();
                if (age > CACHE_DURATION) {
                  cache.delete(request);
                }
              }
            }
          });
        });
      });
    });
  });
}, CACHE_DURATION / 2); // Run cleanup every 3.5 days