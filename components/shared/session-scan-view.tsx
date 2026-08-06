'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { QrScanner } from '@/components/shared/qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SessionScanView({ token }: { token: string | null }) {
  const [autoResult, setAutoResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [autoLoading, setAutoLoading] = useState(!!token)

  useEffect(() => {
    if (!token) return
    let active = true
    setAutoLoading(true)

    fetch('/api/attendance/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (!active) return
        if (data?.ok) {
          setAutoResult({ ok: true, message: 'Kehadiran tercatat! Terima kasih sudah hadir.' })
        } else {
          setAutoResult({ ok: false, message: data?.error ?? 'Gagal mencatat kehadiran.' })
        }
      })
      .catch(() => {
        if (active) setAutoResult({ ok: false, message: 'Terjadi kesalahan jaringan.' })
      })
      .finally(() => {
        if (active) setAutoLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/kegiatan">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kegiatan
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Absen via Scan QR</CardTitle>
        </CardHeader>
        <CardContent>
          {token ? (
            autoLoading ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Mencatat kehadiran...</p>
              </div>
            ) : autoResult ? (
              autoResult.ok ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <p className="font-semibold">Absen Berhasil</p>
                  <p className="text-sm text-muted-foreground">{autoResult.message}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <XCircle className="h-12 w-12 text-destructive" />
                  <p className="font-semibold">Absen Gagal</p>
                  <p className="text-sm text-muted-foreground">{autoResult.message}</p>
                </div>
              )
            ) : null
          ) : (
            <QrScanner />
          )}
        </CardContent>
      </Card>

      {!token && (
        <p className="text-center text-xs text-muted-foreground">
          Pindai QR kegiatan yang ditampilkan panitia atau BPH. Kamera HP biasa pun cukup, halaman
          absensi akan terbuka dan kehadiran Anda tercatat otomatis.
        </p>
      )}
    </div>
  )
}
