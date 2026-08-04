import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ProkerDashboard } from '@/components/shared/proker-dashboard'
import { getApiUserList } from './data'

export const dynamic = 'force-dynamic'

export default async function ProkerPage() {
  const user = await requireSession()

  const where =
    user.role === 'BPH'
      ? {}
      : user.role === 'KADIV'
        ? { divisionId: user.divisionId ?? undefined }
        : { OR: [{ divisionId: user.divisionId ?? undefined }, { pjId: user.id }] }

  const prokers = await prisma.proker.findMany({
    where,
    include: {
      division: { select: { id: true, name: true, slug: true } },
      proposedBy: { select: { id: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
      pj: { select: { id: true, name: true } },
      tasks: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = prokers.map((p) => ({
    ...p,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    estimateBudget: p.estimateBudget?.toString() ?? null,
    actualBudget: p.actualBudget?.toString() ?? null,
    approvedAt: p.approvedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <div>
      <PageHeader
        title="Program Kerja"
        description={
          user.role === 'BPH'
            ? 'Monitoring seluruh proker lintas divisi.'
            : 'Kelola proker divisi Anda dari pengajuan hingga selesai.'
        }
        action={
          user.role === 'BPH' || user.role === 'KADIV' ? (
            <Button asChild>
              <Link href="/proker/new">
                <Plus className="h-4 w-4" />
                Ajukan Proker
              </Link>
            </Button>
          ) : undefined
        }
      />

      <ProkerDashboard
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        prokers={serialized}
        users={await getApiUserList()}
        isBPH={user.role === 'BPH'}
      />
    </div>
  )
}
