'use client'

import { useEffect } from 'react'

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function subKeys(sub: PushSubscription) {
  return {
    endpoint: sub.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
      auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
    },
  }
}

// Re-sync subscription yang sudah ada ke server (mis. setelah DB reset).
// TIDAK meminta izin — pemicu izin ada di tombol "Aktifkan Notifikasi" (navbar).
export function PushSubscriber({ userId }: { userId: string }) {
  useEffect(() => {
    if (!userId) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (!VAPID_KEY) return

    async function sync() {
      try {
        const reg = await navigator.serviceWorker.ready
        const existing = await reg.pushManager.getSubscription()
        if (!existing) return
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subKeys(existing)),
        }).catch(() => {})
      } catch {
        // abaikan
      }
    }

    sync()
  }, [userId])

  return null
}
