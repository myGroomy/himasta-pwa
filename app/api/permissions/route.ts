import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getApiSession,
  requireApiSession,
  isApiResponse,
  badRequest,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const createSchema = z.object({
  reason: z.string().min(5, 'Alasan izin minimal 5 karakter').max(1000),
  sessionTitle: z.string().min(3, 'Nama kegiatan minimal 3 karakter').max(200),
  sessionId: z.string().nullable().optional(),
  startTime: z.string().datetime().nullable().optional(),
})

const PERMISSION_INCLUDE = {
  requester: { select: { id: true, name: true, divisionId: true, division: { select: { name: true } } } },
  approvedBy: { select: { id: true, name: true } },
}

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Kadiv/BPH lihat izin divisi sendiri + izin punya sendiri; anggota hanya izin sendiri
  const where =
    user.role === 'BPH'
      ? {}
      : user.role === 'KADIV'
      ? { OR: [{ requesterId: user.id }, { requester: { divisionId: user.divisionId ?? undefined } }] }
      : { requesterId: user.id }

  const permissions = await prisma.permission.findMany({
    where,
    include: PERMISSION_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ permissions })
}

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['ANGGOTA', 'KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  try {
    const permission = await prisma.permission.create({
      data: {
        reason: parsed.data.reason,
        sessionTitle: parsed.data.sessionTitle,
        sessionId: parsed.data.sessionId ?? null,
        startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : null,
        requesterId: user.id,
      },
      include: PERMISSION_INCLUDE,
    })
    return NextResponse.json({ permission }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}
