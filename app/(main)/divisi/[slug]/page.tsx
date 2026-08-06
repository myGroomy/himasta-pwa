import { DivisionWorkspaceView } from '@/components/shared/division-workspace-view'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'

export const dynamic = 'force-dynamic'

export default async function DivisionWorkspacePage({ params }: { params: { slug: string } }) {
  const user = await requireSession()

  const division = await prisma.division.findUnique({
    where: { slug: params.slug },
    include: {
      _count: { select: { users: true, documents: true } },
    },
  })

  if (!division) notFound()

  const isOwnDivision = user.divisionId === division.id
  const isBPH = user.role === 'BPH'
  const canAccess = isBPH || isOwnDivision || user.role === 'DOSEN'

  if (!canAccess) {
    return (
      <div>
        <PageHeader title="Akses Dibatasi" description="Workspace ini hanya untuk anggota divisi terkait." />
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Portal</Link>
        </Button>
      </div>
    )
  }

  const [announcements, documents, members, sessions] = await Promise.all([
    prisma.announcement.findMany({
      where: { divisionId: division.id, status: 'PUBLISHED' },
      include: {
        author: { select: { name: true, email: true } },
        division: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    }),
    prisma.document.findMany({
      where: { divisionId: division.id },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.user.findMany({
      where: { divisionId: division.id, isActive: true, role: { not: 'DOSEN' } },
      select: { id: true, name: true, nim: true, role: true },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    }),
    prisma.attendanceSession.findMany({
      where: { divisionId: division.id },
      orderBy: { startTime: 'desc' },
      take: 20,
    }),
  ])

  const canManage = isBPH || isOwnDivision

  return (
    <DivisionWorkspaceView
      division={division}
      user={user}
      members={members}
      documents={documents}
      tasks={[]} // disuplai dari table proker tasks (opsional) atau empty array ponytail
      sessions={sessions}
      canManage={canManage}
    />
  )
}
