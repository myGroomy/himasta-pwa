import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { PiketDashboard } from '@/components/shared/piket-dashboard'

export const dynamic = 'force-dynamic'

export default async function PiketPage() {
  const user = await requireSession()

  const [pikets, users] = await Promise.all([
    prisma.piket.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nim: true,
            role: true,
            division: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        NOT: { role: 'DOSEN' } // Dosen tidak piket
      },
      select: {
        id: true,
        name: true,
        nim: true,
        role: true,
        division: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  // Map to serializable format
  const serializedPikets = pikets.map((p) => ({
    ...p,
    date: p.date.toISOString(),
    checkedInAt: p.checkedInAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div>
      <PageHeader
        title="Jadwal Piket Sekretariat"
        description="Pantau jadwal piket harian dan lakukan absensi piket di sini."
      />
      <PiketDashboard
        currentUser={{ id: user.id, role: user.role }}
        initialPikets={serializedPikets as any}
        users={users as any}
      />
    </div>
  )
}
