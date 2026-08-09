/* Service Worker sederhana HIMASTA V2 (web push) */
const CACHE_NAME = 'himasta-v2'
const APP_SHELL = ['/', '/login', '/manifest.json', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Hanya cache untuk asal yang sama (same-origin)
  if (url.origin !== self.location.origin) return

  // Navigasi halaman: coba network dulu, fallback ke cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    )
    return
  }

  // Aset statis: cache-first dengan update di background
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})

// Web Push Notification Handlers (PRD V2 3.7)
self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const payload = event.data.json()
    const title = payload.title || 'Notifikasi HIMASTA'
    const options = {
      body: payload.body || 'Ada pengumuman atau pembaruan baru.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: payload.url || '/notifikasi' },
    }
    event.waitUntil(self.registration.showNotification(title, options))
  } catch (err) {
    const options = {
      body: event.data.text(),
      icon: '/icon.svg',
      data: { url: '/notifikasi' },
    }
    event.waitUntil(self.registration.showNotification('HIMASTA PWA', options))
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

