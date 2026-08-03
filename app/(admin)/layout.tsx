import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/shared/navbar'
import { OfflineIndicator } from '@/components/shared/offline-indicator'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(['BPH'])

  const [divisions, unreadCount] = await Promise.all([
    prisma.division.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <OfflineIndicator />
      <Navbar user={user} divisions={divisions} unreadCount={unreadCount} />
      <main className="container py-6">{children}</main>
    </div>
  )
}
