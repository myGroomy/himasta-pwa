import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { EventDashboard } from '@/components/shared/event-dashboard'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const user = await requireSession()
  const now = new Date()

  const where: any =
    user.role === 'BPH'
      ? {}
      : user.role === 'KADIV'
        ? {
          OR: [
            { divisionId: user.divisionId ?? undefined },
            { visibility: 'PUBLIC', status: 'PUBLISHED' },
          ],
        }
        : { visibility: 'PUBLIC', status: 'PUBLISHED' }

  const events = await prisma.event.findMany({
    where,
    include: {
      division: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startTime: 'asc' },
    take: 200,
  })

  const serialized = events.map((e) => ({
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime?.toISOString() ?? null,
    publishedAt: e.publishedAt?.toISOString() ?? null,
    approvedAt: e.approvedAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
    isUpcoming: e.startTime > now,
  }))

  // Event tempat user sudah terdaftar (anggota)
  const myRegistrations = await prisma.eventRegistration.findMany({
    where: { userId: user.id },
    select: { eventId: true, qrToken: true, attended: true },
  })
  const myEventIds = new Set(myRegistrations.map((r) => r.eventId))

  return (
    <div>
      <PageHeader
        title="Event"
        description="Kelola event besar HIMASTA seminar, workshop, dan kegiatan publik."
        action={
          user.role === 'BPH' || user.role === 'KADIV' ? (
            <Button asChild>
              <Link href="/events/new">
                <Plus className="h-4 w-4" />
                Buat Event
              </Link>
            </Button>
          ) : undefined
        }
      />

      <EventDashboard
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        events={serialized}
        myEventIds={[...myEventIds]}
        myQrByEvent={Object.fromEntries(
          myRegistrations.map((r) => [r.eventId, { qrToken: r.qrToken ?? '', attended: r.attended }])
        )}
      />
    </div>
  )
}
