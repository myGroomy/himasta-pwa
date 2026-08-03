'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    function update() {
      setOffline(!navigator.onLine)
    }
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-1.5 text-sm font-medium text-amber-950">
      <WifiOff className="h-4 w-4" />
      Kamu sedang offline — data tersimpan di perangkat tetap bisa diakses, perubahan akan disinkronkan saat koneksi kembali.
    </div>
  )
}
