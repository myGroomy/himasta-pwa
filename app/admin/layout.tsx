import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/shared/navbar'
import { BottomNav } from '@/components/shared/bottom-nav'
import { OfflineIndicator } from '@/components/shared/offline-indicator'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['BPH', 'KADIV'])

  const [divisions, unreadCount, latestNotifications] = await Promise.all([
    prisma.division.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
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
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-24">
      <OfflineIndicator />
      <Navbar user={user} divisions={divisions} unreadCount={unreadCount} latestNotifications={latestNotifications} />
      <main className="container py-6 px-4">{children}</main>
      <BottomNav user={user} divisions={divisions} />
    </div>
  )
}
