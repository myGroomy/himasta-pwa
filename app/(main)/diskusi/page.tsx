import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { DivisionDiscussion } from './division-discussion'

export const dynamic = 'force-dynamic'

export default async function DiskusiPage() {
  const user = await requireSession()

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div>
      <PageHeader
        title="Diskusi"
        description="Forum tanya jawab dan berbagi informasi antar anggota per divisi."
      />
      <DivisionDiscussion
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        divisions={divisions}
      />
    </div>
  )
}
