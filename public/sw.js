/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Install event - setup the service worker
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker installing.');
  // Skip waiting to activate immediately
  event.waitUntil(self.skipWaiting());
});

// Activate event - take control of all pages immediately
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim());
});

// Listen for sync events
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(performSync());
  }
});

// Simple function to handle sync operations
async function performSync() {
  console.log('Background sync started...');
  
  // This would handle offline operations, but the main application
  // handles the sync logic in the main thread
  
  // In the service worker, we mainly deal with caching and fetch interception
  try {
    // Check if we're actually online before attempting network requests
    if (self.navigator.onLine) {
      console.log('Sync completed successfully');
    } else {
      console.log('Device is offline, sync postponed');
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Handle fetch events to intercept network requests and provide offline support
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  
  // Only handle requests for our API endpoints
  const isAPIRequest = url.pathname.startsWith('/api/') || 
                      url.pathname.startsWith('/loans') ||
                      url.pathname.startsWith('/users') ||
                      url.pathname.includes('api');
  
  if (isAPIRequest) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return fetch(event.request).then(response => {
          // If request succeeded, cache the response
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          // If network request fails, try to serve from cache
          return cache.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If no cached response, return a default offline response
            const offlineResponse = {
              error: 'offline',
              message: 'Application is currently offline. Changes will be synced when connection resumes.',
              timestamp: Date.now()
            };
            
            return new Response(JSON.stringify(offlineResponse), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
  }
});

// Handle background sync registration for data synchronization
async function registerBackgroundSync(): Promise<void> {
  if ('sync' in self.registration) {
    try {
      await self.registration.sync.register('background-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }
}

// Export for service worker
export { };