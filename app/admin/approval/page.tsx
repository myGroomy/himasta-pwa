import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { ApprovalCenter } from '@/components/shared/approval-center'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ApprovalPage() {
  const user = await requireRole(['BPH', 'KADIV'])

  const [pendingAnnouncements, pendingProkers, pendingEvents, logs] = await Promise.all([
    prisma.announcement.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        author: { select: { id: true, name: true, email: true, role: true } },
        division: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.proker.findMany({
      where: { status: 'RENCANA' },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        proposedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.event.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
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

  const serializedAnnouncements = pendingAnnouncements.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }))
  const serializedProkers = pendingProkers.map((p) => ({
    ...p,
    startDate: p.startDate?.toISOString() ?? null,
    endDate: p.endDate?.toISOString() ?? null,
    estimateBudget: p.estimateBudget?.toString() ?? null,
    actualBudget: p.actualBudget?.toString() ?? null,
    approvedAt: p.approvedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }))
  const serializedEvents = pendingEvents.map((e) => ({
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime?.toISOString() ?? null,
    publishedAt: e.publishedAt?.toISOString() ?? null,
    approvedAt: e.approvedAt?.toISOString() ?? null,
    createdAt: e.createdAt.toISOString(),
  }))
  const serializedLogs = logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))

  const totalPending =
    pendingAnnouncements.length + pendingProkers.length + pendingEvents.length

  return (
    <div>
      <PageHeader
        title="Approval Center"
        description="Satu tempat untuk semua antrian persetujuan pengumuman, proker, dan event."
      />

      <div className="mb-4">
        <Badge variant="warning">
          {totalPending} item menunggu approval
          {pendingProkers.length > 0 && ` (${pendingProkers.length} proker)`}
          {pendingEvents.length > 0 && ` (${pendingEvents.length} event)`}
        </Badge>
      </div>

      <ApprovalCenter
        announcements={serializedAnnouncements}
        prokers={serializedProkers}
        events={serializedEvents}
        logs={serializedLogs}
      />
    </div>
  )
}
