import { prisma, isDatabaseConfigured } from '@/lib/prisma'
import { getOptionalSession } from '@/lib/permissions'
import { WelcomeView } from '@/components/shared/welcome-view'

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  const user = await getOptionalSession()

  let totalUsers = 0
  let activeProkers = 0
  let nextEvent: Awaited<ReturnType<typeof prisma.event.findFirst>> | null = null

  if (isDatabaseConfigured()) {
    try {
      const [users, prokers, event] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.proker.count({ where: { status: 'BERJALAN' } }),
        prisma.event.findFirst({
          where: { visibility: 'PUBLIC', status: 'PUBLISHED' },
          orderBy: { startTime: 'asc' },
        }),
      ])
      totalUsers = users
      activeProkers = prokers
      nextEvent = event
    } catch {
      // Database dikonfigurasi tapi tidak dapat diakses — tampilkan landing tanpa data.
    }
  }

  const eventDate = nextEvent
    ? new Date(nextEvent.startTime).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      }).split(' ')
    : null

  const eventTime = nextEvent
    ? new Date(nextEvent.startTime).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <WelcomeView
      user={user ? { id: user.id, name: user.name, role: user.role } : null}
      totalUsers={totalUsers}
      activeProkers={activeProkers}
      nextEvent={nextEvent as any}
      eventDate={eventDate}
      eventTime={eventTime}
    />
  )
}
