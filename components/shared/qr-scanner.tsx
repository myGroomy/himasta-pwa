'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CheckCircle2, ImagePlus, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SCANNER_ID = 'qr-reader-region'

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'camera-denied'

export function QrScanner() {
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [message, setMessage] = useState('')
  const [scanningFile, setScanningFile] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processedRef = useRef(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const activeRef = useRef(true)

  function getScanner() {
    if (!scannerRef.current) scannerRef.current = new Html5Qrcode(SCANNER_ID, false)
    return scannerRef.current
  }

  async function submitToken(token: string) {
    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        setStatus('success')
        setMessage('Kehadiran tercatat! Terima kasih.')
      } else {
        setStatus('error')
        setMessage(data?.error ?? 'Gagal mencatat kehadiran.')
      }
    } catch {
      setStatus('error')
      setMessage('Terjadi kesalahan jaringan.')
    }
  }

  function resetAfterDelay() {
    setTimeout(() => {
      if (!activeRef.current) return
      processedRef.current = false
      setStatus('scanning')
      setMessage('Arahkan kamera ke QR berikutnya')
    }, 3000)
  }

  async function handleFile(file: File) {
    if (processedRef.current || !activeRef.current) return
    processedRef.current = true
    setScanningFile(true)
    setStatus('scanning')
    setMessage('Memindai foto QR…')
    try {
      const decoded = await getScanner().scanFile(file, false)
      const token = extractToken(decoded)
      if (!token) {
        setStatus('error')
        setMessage('QR tidak terbaca di foto. Coba foto lebih dekat & jelas.')
        resetAfterDelay()
        return
      }
      await submitToken(token)
      resetAfterDelay()
    } catch {
      setStatus('error')
      setMessage('QR tidak terbaca di foto. Coba foto lebih dekat & jelas.')
      resetAfterDelay()
    } finally {
      setScanningFile(false)
    }
  }

  useEffect(() => {
    let html5Qr: Html5Qrcode | null = null
    let active = true
    activeRef.current = true

    async function init() {
      try {
        html5Qr = new Html5Qrcode(SCANNER_ID, false)
        scannerRef.current = html5Qr
        setStatus('scanning')
        setMessage('Arahkan kamera ke QR absensi')

        await html5Qr.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (decodedText) => {
            if (processedRef.current || !active) return
            processedRef.current = true
            const token = extractToken(decodedText)
            if (!token) {
              setStatus('error')
              setMessage('QR tidak dikenal. Gunakan QR dari sesi absensi HIMASTA.')
              resetAfterDelay()
              return
            }
            await submitToken(token)
            resetAfterDelay()
          },
          () => {}
        )
      } catch (err) {
        if (!active) return
        // Kamera getUserMedia gagal (Android WebView/izin) → fallback upload foto.
        setStatus('camera-denied')
        setMessage('Kamera tidak dapat diakses langsung. Ambil foto QR atau unggah gambarnya.')
        console.error(err)
      }
    }

    init()

    return () => {
      active = false
      activeRef.current = false
      processedRef.current = true
      if (html5Qr && html5Qr.isScanning) {
        html5Qr
          .stop()
          .then(() => html5Qr?.clear())
          .catch(() => {})
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div id={SCANNER_ID} className="h-72 w-full overflow-hidden rounded-xl border bg-black" />

      {status === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}
      {status === 'camera-denied' && (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 shrink-0" />
            {message}
          </div>
          <p className="text-center text-xs opacity-80">
            Pastikan akses lewat HTTPS dan izinkan kamera di browser. Buka dari URL https, bukan http.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Coba lagi
            </Button>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              Ambil Foto QR
            </Button>
          </div>
        </div>
      )}
      {status === 'scanning' && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          {scanningFile ? 'Memindai foto…' : message}
        </div>
      )}

      {/* Fallback manual: kamera Android via capture (tanpa getUserMedia) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />
      {status !== 'camera-denied' && (
        <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={scanningFile}>
          <ImagePlus className="h-4 w-4" />
          {scanningFile ? 'Memindai…' : 'Ambil Foto QR'}
        </Button>
      )}
    </div>
  )
}

function extractToken(text: string): string | null {
  try {
    if (/^https?:\/\//i.test(text)) {
      const url = new URL(text)
      const token = url.searchParams.get('token')
      return token && token.length >= 8 ? token : null
    }
    return text.length >= 8 ? text : null
  } catch {
    return text.length >= 8 ? text : null
  }
}
