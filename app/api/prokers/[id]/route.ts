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

const updateSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['RENCANA', 'BERJALAN', 'SELESAI', 'DIBATALKAN']).optional(),
  timeline: z.string().max(200).nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  estimateBudget: z.coerce.number().nonnegative().nullable().optional(),
  actualBudget: z.coerce.number().nonnegative().nullable().optional(),
  pjId: z.string().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const proker = await prisma.proker.findUnique({ where: { id: params.id } })
  if (!proker) return notFound('Proker tidak ditemukan')
  if (user.role === 'KADIV' && proker.divisionId !== user.divisionId) {
    return forbidden('Kadiv hanya bisa mengelola proker divisi sendiri')
  }

  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  try {
    const updated = await prisma.proker.update({
      where: { id: proker.id },
      data: {
        ...parsed.data,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : parsed.data.startDate,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : parsed.data.endDate,
      },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        pj: { select: { id: true, name: true } },
        proposedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ proker: updated })
  } catch (error) {
    return serverError(error)
  }
}
