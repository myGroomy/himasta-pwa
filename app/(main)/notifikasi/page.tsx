import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { NotificationList } from '@/components/shared/notification-list'

export const dynamic = 'force-dynamic'

export default async function NotifikasiPage() {
  const user = await requireSession()
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const serialized = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }))

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Notifikasi" description="Pusat notifikasi in-app Anda." />
      <NotificationList initial={serialized} />
    </div>
  )
}
