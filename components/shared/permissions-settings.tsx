'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, BellRing, Camera, Database, Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

type PushState = 'checking' | 'off' | 'on' | 'denied' | 'unsupported'
type CameraState = 'checking' | 'granted' | 'denied' | 'prompt' | 'unsupported'

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const base64Clean = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64Clean)
  const arr = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

function subKeys(sub: PushSubscription) {
  return {
    endpoint: sub.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))),
      auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))),
    },
  }
}

const pushLabel: Record<PushState, string> = {
  checking: 'Memeriksa…',
  off: 'Belum aktif',
  on: 'Aktif',
  denied: 'Diblokir browser',
  unsupported: 'Tidak didukung',
}

const camLabel: Record<CameraState, string> = {
  checking: 'Memeriksa…',
  granted: 'Diizinkan',
  denied: 'Diblokir',
  prompt: 'Belum ditentukan',
  unsupported: 'Tidak didukung',
}

export function PermissionsSettings() {
  const [push, setPush] = useState<PushState>('checking')
  const [pushBusy, setPushBusy] = useState(false)
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [persistBusy, setPersistBusy] = useState(false)
  const [camera, setCamera] = useState<CameraState>('checking')

  const refreshPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_KEY) {
      setPush('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setPush('denied')
      return
    }
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setPush(sub ? 'on' : 'off')
    } catch {
      setPush('unsupported')
    }
  }, [])

  const refreshPersist = useCallback(async () => {
    if (!navigator.storage?.persisted) {
      setPersisted(null)
      return
    }
    try {
      setPersisted(await navigator.storage.persisted())
    } catch {
      setPersisted(null)
    }
  }, [])

  const refreshCamera = useCallback(async () => {
    if (!navigator.permissions?.query) {
      setCamera('unsupported')
      return
    }
    try {
      const status = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCamera(status.state as CameraState)
    } catch {
      setCamera('prompt')
    }
  }, [])

  useEffect(() => {
    refreshPush()
    refreshPersist()
    refreshCamera()
  }, [refreshPush, refreshPersist, refreshCamera])

  async function togglePush() {
    if (push === 'on') {
      // Matikan: unsubscribe browser + hapus dari server
      setPushBusy(true)
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          })
          await sub.unsubscribe()
        }
        setPush('off')
        toast({ title: 'Notifikasi push dimatikan' })
      } catch {
        toast({ title: 'Gagal mematikan notifikasi', variant: 'destructive' })
      } finally {
        setPushBusy(false)
      }
      return
    }

    if (push === 'off') {
      setPushBusy(true)
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setPush(permission === 'denied' ? 'denied' : 'off')
          return
        }
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subKeys(sub)),
        })
        setPush('on')
        toast({ title: 'Notifikasi push aktif', description: 'Pengumuman baru akan muncul di perangkat Anda.' })
      } catch {
        toast({ title: 'Gagal mengaktifkan notifikasi', variant: 'destructive' })
      } finally {
        setPushBusy(false)
      }
    }
  }

  async function togglePersist() {
    if (persisted) return
    setPersistBusy(true)
    try {
      const granted = await navigator.storage?.persist()
      setPersisted(!!granted)
      toast({
        title: granted ? 'Penyimpanan persisten aktif' : 'Tidak dapat mengaktifkan',
        description: granted
          ? 'Data offline akan disimpan permanen di perangkat.'
          : 'Browser menolak permintaan penyimpanan persisten.',
        variant: granted ? undefined : 'destructive',
      })
    } catch {
      toast({ title: 'Gagal mengaktifkan penyimpanan persisten', variant: 'destructive' })
    } finally {
      setPersistBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <ShieldCheckIcon />
        Perizinan & Notifikasi
      </h3>

      {/* Notifikasi Push */}
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5 pr-3">
          <p className="text-sm font-medium flex items-center gap-1.5">
            {push === 'on' ? <BellRing className="h-3.5 w-3.5 text-primary" /> : push === 'denied' ? <BellOff className="h-3.5 w-3.5 text-destructive" /> : <Bell className="h-3.5 w-3.5" />}
            Notifikasi Push
          </p>
          <p className="text-xs text-muted-foreground">
            {pushLabel[push]} — pengumuman muncul di perangkat walau app ditutup.
            {push === 'denied' && ' Buka pengaturan browser untuk mengizinkan.'}
          </p>
        </div>
        <Switch
          checked={push === 'on'}
          disabled={push === 'checking' || push === 'denied' || push === 'unsupported' || pushBusy}
          onCheckedChange={togglePush}
        />
      </div>

      {/* Penyimpanan Persisten */}
      <div className="flex items-center justify-between py-2 border-t border-border">
        <div className="space-y-0.5 pr-3">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Penyimpanan Persisten
          </p>
          <p className="text-xs text-muted-foreground">
            {persisted === null
              ? 'Browser tidak mendukung / tidak diketahui.'
              : persisted
                ? 'Aktif — data offline tersimpan permanen.'
                : 'Off — browser bisa menghapus cache otomatis.'}
          </p>
        </div>
        <Switch
          checked={persisted === true}
          disabled={persisted === true || persistBusy}
          onCheckedChange={togglePersist}
        />
      </div>

      {/* Status Kamera */}
      <div className="flex items-center justify-between py-2 border-t border-border">
        <div className="space-y-0.5 pr-3">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5" />
            Akses Kamera
          </p>
          <p className="text-xs text-muted-foreground">
            {camLabel[camera]} — dipakai saat scan QR absensi.
            {camera === 'denied' && ' Ubah di pengaturan browser.'}
          </p>
        </div>
        {camera === 'checking' ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <span className={`text-xs font-bold ${camera === 'granted' ? 'text-emerald-600' : camera === 'denied' ? 'text-destructive' : 'text-muted-foreground'}`}>
            {camLabel[camera]}
          </span>
        )}
      </div>
    </div>
  )
}

function ShieldCheckIcon() {
  return (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
