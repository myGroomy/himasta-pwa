import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus, Users } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { AnnouncementCard } from '@/components/shared/announcement-card'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DOC_CATEGORY_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

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

  const [announcements, documents, members] = await Promise.all([
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
  ])

  const canManage = isBPH || isOwnDivision

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Divisi ${division.name}`}
        description={division.description ?? 'Workspace divisi'}
        action={
          canManage ? (
            <Button asChild>
              <Link href={`/announcements/new?division=${division.id}`}>
                <Plus className="h-4 w-4" />
                Posting ke {division.name}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-sm text-muted-foreground">Anggota aktif</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Pengumuman Divisi</h2>
        {announcements.length === 0 ? (
          <EmptyState
            title="Belum ada pengumuman divisi"
            description={canManage ? 'Posting pengumuman pertama untuk divisi ini.' : 'Pengumuman divisi akan tampil di sini.'}
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Dokumen Divisi</h2>
        {documents.length === 0 ? (
          <EmptyState title="Belum ada dokumen divisi" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {documents.map((d) => (
              <Card key={d.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{d.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {DOC_CATEGORY_LABELS[d.category]} · {formatDate(d.createdAt)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">oleh {d.uploadedBy.name}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                        Buka
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Anggota</h2>
        {members.length === 0 ? (
          <EmptyState title="Belum ada anggota" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card key={m.id}>
                <CardContent className="flex items-center gap-3 pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {m.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.nim ?? '—'} {m.role === 'KADIV' && '· Kadiv'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
