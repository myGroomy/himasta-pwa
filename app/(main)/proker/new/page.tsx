import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { ProkerForm } from '@/components/shared/proker-form'

export const dynamic = 'force-dynamic'

export default async function NewProkerPage() {
  const user = await requireSession()

  const [divisions, users] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, divisionId: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div>
      <PageHeader
        title="Ajukan Proker"
        description="Proker baru akan menunggu persetujuan BPH sebelum berjalan."
      />
      <ProkerForm
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        divisions={divisions}
        users={users}
      />
    </div>
  )
}
