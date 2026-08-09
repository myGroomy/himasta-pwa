import { getOptionalSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Navbar } from '@/components/shared/navbar'
import { BottomNav } from '@/components/shared/bottom-nav'
import { OfflineIndicator } from '@/components/shared/offline-indicator'
import { PushSubscriber } from '@/components/shared/push-subscriber'
import { HierarchicalNavigation } from '@/components/shared/hierarchical-navigation'

import { PageTransition } from '@/components/shared/page-transition'

export const dynamic = 'force-dynamic'

// Divisi jarang berubah — cache 5 menit, hindari query di tiap navigasi
const getDivisions = unstable_cache(
  async () =>
    prisma.division.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ['divisions'],
  { revalidate: 300 }
)

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalSession()

  if (!user) {
    return <>{children}</>
  }

  const [divisions, unreadCount, latestNotifications] = await Promise.all([
    getDivisions(),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <OfflineIndicator />
      <PushSubscriber userId={user.id} />
      <HierarchicalNavigation />
      <Navbar user={user} divisions={divisions} unreadCount={unreadCount} latestNotifications={latestNotifications} />
      <main className="container max-w-5xl mx-auto py-12 md:py-24 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav user={user} divisions={divisions} />
    </div>
  )
}
