'use client'

import { useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Fallback pemindaian QR via foto (tanpa getUserMedia).
 * Android WebView/Chrome sering gagal minta akses kamera langsung;
 * input capture="environment" membuka kamera native OS.
 */
export function QrFileFallback({
  getScanner,
  onToken,
}: {
  getScanner: () => Html5Qrcode
  onToken: (token: string) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const processedRef = useRef(false)

  async function handleFile(file: File) {
    if (processedRef.current) return
    processedRef.current = true
    setBusy(true)
    setError('')
    try {
      const decoded = await getScanner().scanFile(file, false)
      if (!decoded) throw new Error('empty')
      await onToken(decoded)
    } catch {
      setError('QR tidak terbaca di foto. Coba foto lebih dekat & jelas.')
    } finally {
      processedRef.current = false
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
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
      <Button type="button" variant="outline" className="w-full" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {busy ? 'Memindai…' : 'Ambil Foto QR'}
      </Button>
      {error && <p className="text-center text-xs text-destructive">{error}</p>}
    </div>
  )
}
