'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { QrScanner } from '@/components/shared/qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function ScanView() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
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
        <Link href="/absensi">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Absensi
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scan QR Absensi</CardTitle>
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
          Arahkan kamera ke QR yang ditampilkan Kadiv/BPH saat rapat. QR juga bisa dipindai dari kamera HP biasa
          dan akan membuka halaman ini otomatis.
        </p>
      )}
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ScanView />
    </Suspense>
  )
}
