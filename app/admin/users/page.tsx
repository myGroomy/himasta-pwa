import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { UserManager } from '@/components/shared/user-manager'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const user = await requireRole(['BPH'])

  const [users, divisions] = await Promise.all([
    prisma.user.findMany({
      include: {
        division: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.division.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const serialized = users.map((u) => ({
    id: u.id,
    nim: u.nim,
    email: u.email,
    name: u.name,
    role: u.role,
    phone: u.phone,
    isActive: u.isActive,
    pendingApproval: u.pendingApproval,
    division: u.division,
  }))

  return (
    <div>
      <PageHeader
        title="Kelola Anggota"
        description="Setujui pendaftaran baru, kelola peran, divisi, dan status aktif anggota."
      />
      <UserManager initialUsers={serialized} divisions={divisions} />
    </div>
  )
}
