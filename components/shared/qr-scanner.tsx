'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SCANNER_ID = 'qr-reader-region'

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'camera-denied'

export function QrScanner() {
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [message, setMessage] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    let html5Qr: Html5Qrcode | null = null
    let active = true

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
            resetAfterDelay()
          },
          () => {}
        )
      } catch (err) {
        if (!active) return
        setStatus('camera-denied')
        setMessage('Kamera tidak dapat diakses. Izinkan akses kamera atau gunakan kode dari QR di menu Absensi.')
        console.error(err)
      }
    }

    function resetAfterDelay() {
      setTimeout(() => {
        if (!active) return
        processedRef.current = false
        setStatus('scanning')
        setMessage('Arahkan kamera ke QR berikutnya')
      }, 3000)
    }

    init()

    return () => {
      active = false
      processedRef.current = true
      const scanner = scannerRef.current
      if (scanner && scanner.isScanning) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {})
      }
    }
  }, [])

  return (
    <div className="space-y-4">
      <div id={SCANNER_ID} className="overflow-hidden rounded-xl border bg-black" />

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
        <div className="flex flex-col items-center gap-3 rounded-lg bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 shrink-0" />
            {message}
          </div>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Coba lagi
          </Button>
        </div>
      )}
      {status === 'scanning' && (
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          {message}
        </div>
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
