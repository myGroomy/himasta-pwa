'use client'

import { useEffect, useState } from 'react'
import { Download, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

type MyQrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MyQrDialog({ open, onOpenChange }: MyQrDialogProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setQrDataUrl(null)

    fetch('/api/attendance/my-qr')
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (cancelled) return
        if (!data?.qrDataUrl) {
          setError(data?.error ?? 'Gagal generate QR')
          return
        }
        setQrDataUrl(data.qrDataUrl)
      })
      .catch(() => {
        if (!cancelled) setError('Terjadi kesalahan saat generate QR')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open])

  async function downloadQr() {
    if (!qrDataUrl) return
    try {
      const link = document.createElement('a')
      link.href = qrDataUrl
      link.download = 'qr-pribadi-himasta.png'
      link.click()
    } catch {
      toast({ title: 'Gagal mengunduh QR', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="pr-6">QR Absensi Saya</DialogTitle>
          <DialogDescription>
            Tunjukkan QR ini ke BPH/Kadiv saat kegiatan agar kehadiran Anda dicatat.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {loading && (
            <div className="flex h-64 w-64 items-center justify-center rounded-xl border bg-muted/30">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && !loading && (
            <div className="flex h-64 w-64 flex-col items-center justify-center gap-2 rounded-xl border bg-muted/30 p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" /> Tutup
              </Button>
            </div>
          )}

          {qrDataUrl && !loading && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Pribadi"
                className="h-64 w-64 rounded-xl border bg-white p-3"
              />
              <p className="text-center text-xs text-muted-foreground">
                Saat ada kegiatan, BPH/Kadiv memindai QR ini lewat menu Scan di halaman Kegiatan
                untuk mencatat kehadiran Anda.
              </p>
              <Button variant="outline" size="sm" onClick={downloadQr}>
                <Download className="h-4 w-4" />
                Unduh QR
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
