self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('studyzone-v1').then((cache) => {
      return cache.addAll(['/', '/manifest.json'])
    })
  )
  self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open('studyzone-v1').then((cache) => {
          cache.put(event.request, clone)
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
