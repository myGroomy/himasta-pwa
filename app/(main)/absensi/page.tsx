import Link from 'next/link'
import { ScanLine } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { AttendanceDashboard } from '@/components/shared/attendance-dashboard'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AbsensiPage() {
  const user = await requireSession()

  const sessionWhere =
    user.role === 'BPH'
      ? {}
      : user.divisionId
        ? { OR: [{ divisionId: user.divisionId }, { divisionId: null }] }
        : { createdById: user.id }

  const [sessions, myRecords, divisions] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: sessionWhere,
      include: {
        division: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { records: true } },
        records: { select: { status: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 100,
    }),
    prisma.attendanceRecord.findMany({
      where: { userId: user.id },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            startTime: true,
            division: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
      take: 50,
    }),
    prisma.division.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const serializableSessions = sessions.map((s) => ({
    ...s,
    startTime: s.startTime.toISOString(),
    endTime: s.endTime?.toISOString() ?? null,
    // breakdown status kehadiran utk rekap (Hadir / Izin / Tanpa Keterangan)
    statusCounts: s.records.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
    records: undefined,
  }))
  const serializableRecords = myRecords.map((r) => ({
    ...r,
    scannedAt: r.scannedAt.toISOString(),
    session: {
      ...r.session,
      startTime: r.session.startTime.toISOString(),
    },
  }))

  return (
    <div>
      <PageHeader
        title="Absensi"
        description="Absensi rapat via QR tanpa tanda tangan manual."
        action={
          <Button asChild>
            <Link href="/absensi/scan">
              <ScanLine className="h-4 w-4" />
              Scan QR
            </Link>
          </Button>
        }
      />

      <AttendanceDashboard
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        sessions={serializableSessions}
        myRecords={serializableRecords}
        divisions={divisions}
      />
    </div>
  )
}
