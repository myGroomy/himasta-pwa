import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { PermissionDashboard } from '@/components/shared/permission-dashboard'

export const dynamic = 'force-dynamic'

export default async function IzinPage() {
  const user = await requireSession()

  const where =
    user.role === 'BPH'
      ? {}
      : user.role === 'KADIV'
      ? {
          OR: [
            { requesterId: user.id },
            { requester: { divisionId: user.divisionId ?? undefined } },
          ],
        }
      : { requesterId: user.id }

  const permissions = await prisma.permission.findMany({
    where,
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          divisionId: true,
          division: { select: { name: true } },
        },
      },
      approvedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const serialized = permissions.map((p) => ({
    ...p,
    startTime: p.startTime?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    decidedAt: p.decidedAt?.toISOString() ?? null,
  }))

  return (
    <div>
      <PageHeader
        title="Perizinan"
        description={
          user.role === 'KADIV' || user.role === 'BPH'
            ? 'Ajukan izin dan proses permohonan izin divisi Anda.'
            : 'Ajukan izin tidak hadir sebelum rapat atau kegiatan berlangsung.'
        }
      />
      <PermissionDashboard
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        permissions={serialized}
      />
    </div>
  )
}
