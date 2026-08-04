import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireApiSession,
  isApiResponse,
  badRequest,
  notFound,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const decisionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  note: z.string().max(500).optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return notFound('Event tidak ditemukan')

  const body = await req.json().catch(() => null)
  const parsed = decisionSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { action, note } = parsed.data

  try {
    const updated = await prisma.event.update({
      where: { id: event.id },
      data:
        action === 'APPROVE'
          ? {
              status: 'PUBLISHED',
              approvedById: user.id,
              approvedAt: new Date(),
              publishedAt: new Date(),
              rejectedReason: null,
            }
          : {
              status: 'REJECTED',
              approvedById: user.id,
              approvedAt: new Date(),
              rejectedReason: note ?? 'Event ditolak',
            },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: event.createdById,
        title: action === 'APPROVE' ? 'Event disetujui' : 'Event ditolak',
        message: `"${event.name}" ${action === 'APPROVE' ? 'disetujui dan tayang ke publik' : `ditolak: ${note ?? ''}`}.`,
        link: '/events',
      },
    })

    return NextResponse.json({ event: updated })
  } catch (error) {
    return serverError(error)
  }
}
