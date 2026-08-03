import Link from 'next/link'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ApprovalList } from '@/components/shared/approval-list'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ApprovalPage() {
  const user = await requireRole(['BPH'])

  const pending = await prisma.announcement.findMany({
    where: { status: 'PENDING_APPROVAL' },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      division: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const [recent, logs] = await Promise.all([
    prisma.announcement.findMany({
      where: { status: { in: ['PUBLISHED', 'REJECTED'] } },
      include: {
        author: { select: { id: true, name: true } },
        division: { select: { id: true, name: true, slug: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.approvalLog.findMany({
      include: {
        actor: { select: { id: true, name: true } },
        announcement: {
          select: {
            id: true,
            title: true,
            status: true,
            rejectionReason: true,
            author: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const serialized = pending.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))
  const serializedRecent = recent.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    publishedAt: a.publishedAt?.toISOString() ?? null,
  }))
  const serializedLogs = logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))

  return (
    <div>
      <PageHeader
        title="Approval Center"
        description="Setujui atau tolak pengumuman general dari Kadiv sebelum tayang."
      />

      <div className="mb-4">
        <Badge variant="warning">{pending.length} pengumuman menunggu approval</Badge>
      </div>

      {serialized.length === 0 ? (
        <EmptyState title="Tidak ada pengumuman menunggu approval" />
      ) : (
        <ApprovalList initial={serialized} />
      )}

      {serializedRecent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Riwayat Keputusan</h2>
          <div className="space-y-2">
            {serializedRecent.map((a) => (
              <Link
                key={a.id}
                href={`/announcements/${a.id}`}
                className="block rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.author.name} · {a.division?.name ?? 'General'} · oleh{' '}
                      {a.approvedBy?.name ?? 'BPH'}
                    </p>
                  </div>
                  {a.status === 'PUBLISHED' ? (
                    <Badge variant="success">Disetujui</Badge>
                  ) : (
                    <Badge variant="destructive">Ditolak</Badge>
                  )}
                </div>
                {a.status === 'REJECTED' && a.rejectionReason && (
                  <p className="mt-2 rounded-md bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    Alasan: {a.rejectionReason}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {serializedLogs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Audit Trail</h2>
          <div className="space-y-2">
            {serializedLogs.map((l) => (
              <div key={l.id} className="rounded-lg border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground">{l.actor.name}</span>{' '}
                    {l.action === 'APPROVE' ? (
                      <Badge variant="success">menyetujui</Badge>
                    ) : (
                      <Badge variant="destructive">menolak</Badge>
                    )}{' '}
                    «{l.announcement.title}»
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                {l.note && <p className="mt-1 text-xs text-muted-foreground">{l.note}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
