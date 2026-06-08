self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('studyzone-v1').then((cache) => {
      return cache.addAll(['/', '/manifest.json'])
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  // Never cache POST requests or API routes
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache successful responses for static assets
        if (response.status === 200) {
          const clone = response.clone()
          caches.open('studyzone-v1').then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
