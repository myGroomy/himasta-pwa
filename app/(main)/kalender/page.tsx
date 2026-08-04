import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { NotionCalendarView } from '@/components/shared/notion-calendar-view'

export const dynamic = 'force-dynamic'

export default async function KalenderPage() {
  const user = await requireSession()

  const [divisions, sessions, prokers, events] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
    prisma.attendanceSession.findMany({
      where:
        user.role === 'BPH'
          ? {}
          : { OR: [{ divisionId: user.divisionId ?? undefined }, { divisionId: null }] },
      include: { division: { select: { id: true, name: true, slug: true } } },
      orderBy: { startTime: 'asc' },
      take: 300,
    }),
    prisma.proker.findMany({
      where: user.role === 'BPH' ? {} : { divisionId: user.divisionId ?? undefined },
      include: { division: { select: { id: true, name: true, slug: true } } },
      take: 300,
    }),
    prisma.event.findMany({
      where:
        user.role === 'BPH'
          ? {}
          : user.role === 'KADIV'
            ? {
              OR: [
                { divisionId: user.divisionId ?? undefined },
                { visibility: 'PUBLIC', status: 'PUBLISHED' },
              ],
            }
            : { visibility: 'PUBLIC', status: 'PUBLISHED' },
      include: { division: { select: { id: true, name: true, slug: true } } },
      orderBy: { startTime: 'asc' },
      take: 300,
    }),
  ])

  const items = [
    ...sessions.map((s) => ({
      id: `s-${s.id}`,
      type: 'Rapat' as const,
      title: s.title,
      startTime: s.startTime.toISOString(),
      divisionId: s.divisionId,
      divisionName: s.division?.name ?? 'General',
      link: '/kegiatan',
    })),
    ...prokers.map((p) => ({
      id: `p-${p.id}`,
      type: 'Proker' as const,
      title: p.name,
      startTime: p.startDate?.toISOString() ?? p.createdAt.toISOString(),
      divisionId: p.divisionId,
      divisionName: p.division.name,
      link: '/proker',
    })),
    ...events.map((e) => ({
      id: `e-${e.id}`,
      type: 'Event' as const,
      title: e.name,
      startTime: e.startTime.toISOString(),
      divisionId: e.divisionId,
      divisionName: e.division?.name ?? 'General',
      link: '/events',
    })),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime))

  return (
    <div>
      <PageHeader
        title="Kalender"
        description="Semua kegiatan HIMASTA (rapat, proker, dan event) dalam satu tampilan."
      />
      <NotionCalendarView divisions={divisions} items={items} />
    </div>
  )
}
