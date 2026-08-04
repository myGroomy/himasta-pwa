import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireApiSession,
  isApiResponse,
  badRequest,
  forbidden,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const createSchema = z.object({
  title: z.string().min(1, 'Judul task wajib diisi').max(200),
  description: z.string().max(1000).optional().nullable(),
  prokerId: z.string(),
  assigneeId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const proker = await prisma.proker.findUnique({
    where: { id: parsed.data.prokerId },
    select: { id: true, divisionId: true },
  })
  if (!proker) return badRequest('Proker tidak ditemukan')
  if (user.role === 'KADIV' && proker.divisionId !== user.divisionId) {
    return forbidden('Kadiv hanya bisa menambah task di proker divisi sendiri')
  }

  try {
    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        prokerId: proker.id,
        assigneeId: parsed.data.assigneeId ?? null,
      },
      include: { assignee: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}
