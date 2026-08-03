import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest, notFound, serverError, rateLimited } from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const approveSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(500).optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimited(req, { limit: 30 })
  if (limited) return limited

  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = approveSchema.safeParse(body)
  if (!parsed.success) return badRequest('Data tidak valid')

  const announcement = await prisma.announcement.findUnique({ where: { id: params.id } })
  if (!announcement) return notFound()
  if (announcement.status !== 'PENDING_APPROVAL') {
    return badRequest('Pengumuman ini tidak dalam status menunggu approval')
  }

  const approved = parsed.data.action === 'approve'
  const note = (approved ? parsed.data.note : parsed.data.reason) ?? null

  // Alasan wajib saat menolak (untuk audit trail & notifikasi author)
  if (!approved && !note?.trim()) {
    return badRequest('Alasan penolakan wajib diisi')
  }

  try {
    await prisma.$transaction([
      prisma.announcement.update({
        where: { id: params.id },
        data: {
          status: approved ? 'PUBLISHED' : 'REJECTED',
          approvedById: user.id,
          rejectionReason: approved ? null : note,
          publishedAt: approved ? new Date() : null,
        },
      }),
      prisma.approvalLog.create({
        data: {
          announcementId: params.id,
          actorId: user.id,
          action: approved ? 'APPROVE' : 'REJECT',
          note,
        },
      }),
    ])

    await notifyAuthor(announcement.authorId, announcement.title, params.id, approved, note)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return serverError(error)
  }
}

async function notifyAuthor(
  authorId: string,
  title: string,
  announcementId: string,
  approved: boolean,
  note: string | null
) {
  const link = `/announcements/${announcementId}`
  if (approved) {
    await prisma.notification.create({
      data: {
        userId: authorId,
        title: 'Pengumuman disetujui',
        message: note
          ? `Pengumuman "${title}" disetujui. Catatan BPH: ${note}`
          : `Pengumuman "${title}" telah disetujui dan tayang.`,
        link,
      },
    })
    return
  }
  await prisma.notification.create({
    data: {
      userId: authorId,
      title: 'Pengumuman ditolak',
      message: note
        ? `Pengumuman "${title}" ditolak. Alasan: ${note}`
        : `Pengumuman "${title}" ditolak.`,
      link,
    },
  })
}
