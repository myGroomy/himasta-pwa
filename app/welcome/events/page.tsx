import { prisma } from '@/lib/prisma'
import { getOptionalSession } from '@/lib/permissions'
import { WelcomeEventsView } from '@/components/shared/welcome-events-view'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Event Umum HIMASTA | Student Portal',
  description: 'Daftar workshop, seminar, dan event Sains Data terbuka untuk umum.',
}

export default async function WelcomeEventsPage() {
  const user = await getOptionalSession()

  // Fetch only public, published events
  const events = await prisma.event.findMany({
    where: {
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
    },
    include: {
      division: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startTime: 'asc' },
  })

  // Check which events the logged-in user is already registered for
  let registeredEventIds: string[] = []
  if (user) {
    const regs = await prisma.eventRegistration.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    })
    registeredEventIds = regs.map((r) => r.eventId)
  }

  // Serialize dates
  const serializedEvents = events.map((e) => ({
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
    publishedAt: e.publishedAt?.toISOString() ?? null,
  }))

  return (
    <WelcomeEventsView
      user={user ? { id: user.id, name: user.name, email: user.email } : null}
      initialEvents={serializedEvents as any}
      initialRegisteredIds={registeredEventIds}
    />
  )
}
