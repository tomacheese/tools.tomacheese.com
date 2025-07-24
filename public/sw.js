// Simple Service Worker for performance optimization
const CACHE_NAME = 'tools-tomacheese-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/assets/css/main.css',
  // Add critical pages
  '/tools/text-counter',
  '/tools/password-generator',
  '/tools/color-picker',
  '/tools/base64-encoder'
]

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .catch((error) => {
        console.error('Failed to cache resources during install:', error)
      })
  )
  
  // Force activation of new service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all clients
  self.clients.claim()
})

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If cached, return cached version
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
              .catch((error) => {
                console.error('Failed to cache response:', error)
              })

            return response
          })
          .catch((error) => {
            console.error('Fetch failed:', error)
            
            // Return a basic offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - Tools.tomacheese.com</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
                    .offline-message { max-width: 400px; margin: 0 auto; }
                  </style>
                </head>
                <body>
                  <div class="offline-message">
                    <h1>オフラインです</h1>
                    <p>インターネット接続を確認してページを再読み込みしてください。</p>
                    <button onclick="location.reload()">再読み込み</button>
                  </div>
                </body>
                </html>
                `,
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              )
            }
            
            throw error
          })
      })
  )
})

// Background sync for future enhancement
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync if needed
      Promise.resolve()
    )
  }
})

// Push notifications (placeholder for future enhancement)
self.addEventListener('push', (event) => {
  // Handle push notifications if needed in the future
})

// Handle service worker updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})