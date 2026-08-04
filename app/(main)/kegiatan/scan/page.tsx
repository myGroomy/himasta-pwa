import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { SessionScanView } from '@/components/shared/session-scan-view'
import { MemberQrScanner } from '@/components/shared/member-qr-scanner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function KegiatanScanPage({
  searchParams,
}: {
  searchParams: { token?: string; session?: string; member?: string }
}) {
  const user = await requireSession()
  const isManager = user.role === 'KADIV' || user.role === 'BPH'
  const { token, session: sessionId, member } = searchParams

  // 1) Self check-in: QR kegiatan di-scan (auto via URL /kegiatan/scan?token=...)
  if (token) {
    return <SessionScanView token={token} />
  }

  // 2) BPH/Kadiv memindai QR pribadi anggota, terkunci ke satu kegiatan
  if (sessionId) {
    if (!isManager) {
      return (
        <div className="mx-auto max-w-md space-y-4">
          <BackButton />
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <ShieldAlert className="h-10 w-10 text-amber-500" />
              <p className="font-semibold">Khusus BPH/Kadiv</p>
              <p className="text-sm text-muted-foreground">
                Hanya BPH/Kadiv yang boleh memindai QR pribadi anggota untuk menandai kehadiran.
              </p>
              <Button asChild size="sm">
                <Link href="/kegiatan/scan">Absen via QR Kegiatan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      select: { id: true, title: true, isActive: true },
    })
    if (!session) {
      return (
        <div className="mx-auto max-w-md space-y-4">
          <BackButton />
          <Card>
            <CardContent className="py-8 text-center">
              <p className="font-semibold">Kegiatan tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-md space-y-4">
        <BackButton />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Scan QR Anggota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Kegiatan: <span className="font-semibold text-foreground">{session.title}</span>
            </p>
            {session.isActive ? (
              <MemberQrScanner sessionId={session.id} />
            ) : (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
                Kegiatan ini sudah ditutup, tidak bisa mencatat kehadiran.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Arahkan kamera ke QR pribadi anggota (menu QR Saya). Kehadiran langsung tercatat untuk
              kegiatan ini.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 3) QR pribadi dibuka langsung tanpa konteks kegiatan
  if (member) {
    return (
      <div className="mx-auto max-w-md space-y-4">
        <BackButton />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <ShieldAlert className="h-10 w-10 text-amber-500" />
            <p className="font-semibold">Butuh konteks kegiatan</p>
            <p className="text-sm text-muted-foreground">
              Untuk mencatat kehadiran dari QR pribadi, buka tombol{' '}
              <span className="font-semibold text-foreground">Scan</span> pada kartu kegiatan di
              menu Kegiatan.
            </p>
            <Button asChild size="sm">
              <Link href="/kegiatan">Buka Kegiatan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 4) Scanner self check-in (semua role)
  return <SessionScanView token={null} />
}

function BackButton() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ml-2">
      <Link href="/kegiatan">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Kegiatan
      </Link>
    </Button>
  )
}
