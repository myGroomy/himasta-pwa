import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { KegiatanDashboard } from '@/components/shared/kegiatan-dashboard'
import { PageHeader } from '@/components/shared/page-header'
import { QrCode } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function KegiatanPage() {
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
        // records dipakai utk statusCounts; _count.records redundan (records.length)
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
        title="Kegiatan"
        description="Pusat kegiatan HIMASTA. Rapat, makrab, mubes, dan proker. Absensi via QR tanpa tanda tangan manual."
        action={
          <span className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <QrCode className="h-4 w-4" />
            Scan QR kegiatan / QR pribadi anggota
          </span>
        }
      />

      <KegiatanDashboard
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        sessions={serializableSessions}
        myRecords={serializableRecords}
        divisions={divisions}
      />
    </div>
  )
}
