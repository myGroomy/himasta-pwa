import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PeriodeManager } from '@/components/periode/periode-manager'
import { History } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Manajemen Periode | HIMASTA',
  description: 'Kelola pergantian periode kepengurusan HIMASTA',
}

export default async function PeriodePage() {
  await requireRole(['BPH'])

  const periods = await prisma.period.findMany({
    orderBy: { startDate: 'desc' },
    include: {
      _count: { select: { memberHistories: true } },
    },
  })

  const serialized = periods.map(p => ({
    ...p,
    startDate: p.startDate.toISOString(),
    endDate: p.endDate?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <History className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Manajemen Periode</h1>
          <p className="text-sm text-muted-foreground">
            Kelola siklus kepengurusan dan regenerasi anggota
          </p>
        </div>
      </div>

      <PeriodeManager initialPeriods={serialized} />
    </div>
  )
}
