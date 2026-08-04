import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireApiSession,
  isApiResponse,
  badRequest,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const decisionSchema = z.object({
  action: z.enum(['DISETUJUI', 'DITOLAK']),
  note: z.string().max(500).optional().nullable(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const permission = await prisma.permission.findUnique({
    where: { id: params.id },
    include: { requester: { select: { divisionId: true } } },
  })
  if (!permission) return notFound('Izin tidak ditemukan')

  // Kadiv approve izin divisi sendiri; BPH approve semua
  const requesterDivision = permission.requester.divisionId
  if (user.role === 'KADIV' && requesterDivision !== user.divisionId) {
    return forbidden('Kadiv hanya bisa memproses izin divisi sendiri')
  }

  const body = await req.json().catch(() => null)
  const parsed = decisionSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  try {
    const updated = await prisma.permission.update({
      where: { id: permission.id },
      data: {
        status: parsed.data.action,
        approvedById: user.id,
        responseNote: parsed.data.note ?? null,
        decidedAt: new Date(),
      },
      include: {
        requester: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: permission.requesterId,
        title: parsed.data.action === 'DISETUJUI' ? 'Izin disetujui' : 'Izin ditolak',
        message: `Izin "${permission.sessionTitle}" ${parsed.data.action === 'DISETUJUI' ? 'disetujui' : 'ditolak'}.`,
        link: '/izin',
      },
    })

    return NextResponse.json({ permission: updated })
  } catch (error) {
    return serverError(error)
  }
}
