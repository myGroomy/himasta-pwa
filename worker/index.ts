/* Custom worker HIMASTA — di-bundle next-pwa ke dalam service worker (web push). */

type PushPayload = { title?: string; body?: string; url?: string }

const swScope = self as unknown as {
  registration: {
    showNotification(title: string, options?: NotificationOptions): Promise<void>
  }
  clients: {
    matchAll(options?: { type?: string; includeUncontrolled?: boolean }): Promise<
      Array<{ url: string; focus(): void }>
    >
    openWindow(url: string): Promise<void>
  }
  addEventListener(
    type: 'push' | 'notificationclick' | 'activate',
    listener: (event: any) => void
  ): void
}

// Hapus cache lama dari service worker manual versi sebelumnya (himasta-v2/v3)
swScope.addEventListener('activate', () => {
  caches
    .keys()
    .then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('himasta-')).map((k) => caches.delete(k)))
    )
})

// Web Push Notification Handlers (PRD V2 3.7)
swScope.addEventListener('push', (event) => {
  if (!event?.data) return

  try {
    const payload = event.data.json() as PushPayload
    const title = payload?.title || 'Notifikasi HIMASTA'
    const options: NotificationOptions = {
      body: payload?.body || 'Ada pengumuman atau pembaruan baru.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: payload?.url || '/notifikasi' },
    }
    event.waitUntil(swScope.registration.showNotification(title, options))
  } catch (_e) {
    const options: NotificationOptions = {
      body: event.data.text(),
      icon: '/icon.svg',
      data: { url: '/notifikasi' },
    }
    event.waitUntil(swScope.registration.showNotification('HIMASTA PWA', options))
  }
})

swScope.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil(
    swScope.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === targetUrl && 'focus' in client) {
            client.focus()
            return
          }
        }
        return swScope.clients.openWindow(targetUrl)
      })
  )
})
