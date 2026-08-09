'use client'

import { useState } from 'react'
import { toPng } from 'html-to-image'
import { Download, ImageDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

// Render kartu anggota (HTML #member-card) menjadi gambar PNG asli,
// lalu unduh / lihat pratinjau.
export function KtaActions() {
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function capture(): Promise<string | null> {
    const node = document.getElementById('member-card')
    if (!node) return null
    return toPng(node, {
      pixelRatio: 2, // hasil 2x resolusi layar — tajam untuk cetak
      cacheBust: true,
    })
  }

  async function handleDownload() {
    setBusy(true)
    try {
      const url = await capture()
      if (!url) {
        toast({ title: 'Kartu tidak ditemukan', variant: 'destructive' })
        return
      }
      const a = document.createElement('a')
      a.download = 'KTA-HIMASTA.png'
      a.href = url
      a.click()
      toast({ title: 'KTA terunduh', description: 'Gambar PNG kartu anggota berhasil disimpan.' })
    } catch {
      toast({
        title: 'Gagal membuat gambar',
        description: 'Foto profil dari server mungkin memblokir render. Coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handlePreview() {
    setBusy(true)
    try {
      const url = await capture()
      if (!url) {
        toast({ title: 'Kartu tidak ditemukan', variant: 'destructive' })
        return
      }
      setPreview(url)
    } catch {
      toast({ title: 'Gagal membuat gambar', variant: 'destructive' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="w-full h-10 gap-2"
          disabled={busy}
          onClick={handlePreview}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
          Lihat Gambar
        </Button>
        <Button className="w-full h-10 gap-2" disabled={busy} onClick={handleDownload}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Unduh PNG
        </Button>
      </div>

      {preview && (
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Pratinjau KTA" className="w-full rounded-lg" />
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="ghost" onClick={() => setPreview(null)}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
