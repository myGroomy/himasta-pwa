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
  description: z.string().max(3000).nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  capacity: z.coerce.number().int().positive().nullable().optional(),
  visibility: z.enum(['INTERNAL', 'PUBLIC']).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return notFound('Event tidak ditemukan')
  if (user.role === 'KADIV' && event.divisionId !== user.divisionId) {
    return forbidden('Kadiv hanya bisa mengelola event divisi sendiri')
  }

  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  try {
    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        ...parsed.data,
        startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : undefined,
        endTime:
          parsed.data.endTime === undefined ? undefined : parsed.data.endTime ? new Date(parsed.data.endTime) : null,
      },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ event: updated })
  } catch (error) {
    return serverError(error)
  }
}
