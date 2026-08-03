import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest, serverError, rateLimited } from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Pilih minimal satu pengumuman'),
  action: z.enum(['approve', 'reject']),
  note: z.string().max(500).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const limited = rateLimited(req, { limit: 20 })
  if (limited) return limited

  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = bulkSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { ids, action, note } = parsed.data
  const approved = action === 'approve'

  const announcements = await prisma.announcement.findMany({
    where: { id: { in: ids }, status: 'PENDING_APPROVAL' },
    select: { id: true, title: true, authorId: true },
  })

  // Tolak jika ada id yang tidak pending
  if (announcements.length !== ids.length) {
    return badRequest('Beberapa pengumuman tidak dalam status menunggu approval')
  }

  try {
    await prisma.$transaction([
      prisma.announcement.updateMany({
        where: { id: { in: ids } },
        data: {
          status: approved ? 'PUBLISHED' : 'REJECTED',
          approvedById: user.id,
          rejectionReason: approved ? null : note,
          publishedAt: approved ? new Date() : null,
        },
      }),
      prisma.approvalLog.createMany({
        data: announcements.map((a) => ({
          announcementId: a.id,
          actorId: user.id,
          action: approved ? 'APPROVE' : 'REJECT',
          note,
        })),
      }),
    ])

    await Promise.all(
      announcements.map((a) =>
        prisma.notification.create({
          data: {
            userId: a.authorId,
            title: approved ? 'Pengumuman disetujui' : 'Pengumuman ditolak',
            message: approved
              ? `Pengumuman "${a.title}" telah disetujui dan tayang.`
              : note
              ? `Pengumuman "${a.title}" ditolak. Alasan: ${note}`
              : `Pengumuman "${a.title}" ditolak.`,
            link: `/announcements/${a.id}`,
          },
        })
      )
    )

    return NextResponse.json({ ok: true, count: announcements.length })
  } catch (error) {
    return serverError(error)
  }
}
