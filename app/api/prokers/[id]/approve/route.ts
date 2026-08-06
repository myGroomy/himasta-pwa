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

  const proker = await prisma.proker.findUnique({ where: { id: params.id } })
  if (!proker) return notFound('Proker tidak ditemukan')
  if (proker.status !== 'RENCANA') {
    return badRequest('Hanya proker dengan status RENCANA yang dapat diproses')
  }

  const body = await req.json().catch(() => null)
  const parsed = decisionSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { action, note } = parsed.data

  try {
    const updated = await prisma.proker.update({
      where: { id: proker.id },
      data:
        action === 'APPROVE'
          ? {
              status: 'BERJALAN',
              approvedById: user.id,
              approvedAt: new Date(),
              rejectedReason: null,
            }
          : {
              status: 'DIBATALKAN',
              approvedById: user.id,
              approvedAt: new Date(),
              rejectedReason: note ?? 'Pengajuan ditolak',
            },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        proposedBy: { select: { id: true, name: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: proker.proposedById,
        title: action === 'APPROVE' ? 'Proker disetujui' : 'Proker ditolak',
        message: `"${proker.name}" ${action === 'APPROVE' ? 'disetujui oleh BPH' : `ditolak: ${note ?? ''}`}.`,
        link: '/proker',
      },
    })

    return NextResponse.json({ proker: updated })
  } catch (error) {
    return serverError(error)
  }
}
