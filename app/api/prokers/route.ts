import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getApiSession,
  requireApiSession,
  isApiResponse,
  badRequest,
  forbidden,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const createSchema = z.object({
  name: z.string().min(3, 'Nama proker minimal 3 karakter').max(200),
  description: z.string().max(2000).optional().nullable(),
  divisionId: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  timeline: z.string().max(200).optional().nullable(),
  estimateBudget: z.coerce.number().nonnegative().optional().nullable(),
  pjId: z.string().optional().nullable(),
})

const PROKER_INCLUDE = {
  division: { select: { id: true, name: true, slug: true } },
  proposedBy: { select: { id: true, name: true, role: true } },
  approvedBy: { select: { id: true, name: true } },
  pj: { select: { id: true, name: true } },
  _count: { select: { tasks: true } },
}

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prokers = await prisma.proker.findMany({
    where: user.role === 'BPH' ? {} : { divisionId: user.divisionId ?? undefined },
    include: PROKER_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json({ prokers })
}

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { name, description, divisionId, startDate, endDate, timeline, estimateBudget, pjId } =
    parsed.data

  const targetDivision = divisionId ?? user.divisionId
  if (!targetDivision) {
    return badRequest('Divisi wajib diisi untuk mengajukan proker')
  }
  if (user.role === 'KADIV' && targetDivision !== user.divisionId) {
    return forbidden('Kadiv hanya bisa mengajukan proker divisi sendiri')
  }

  try {
    const proker = await prisma.proker.create({
      data: {
        name,
        description: description ?? null,
        divisionId: targetDivision,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        timeline: timeline ?? null,
        estimateBudget: estimateBudget ?? null,
        pjId: pjId ?? null,
        proposedById: user.id,
      },
      include: PROKER_INCLUDE,
    })
    await notifyBphNewProker(user, proker.name)
    return NextResponse.json({ proker }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}

async function notifyBphNewProker(proposer: SessionUser, prokerName: string) {
  const bphs = await prisma.user.findMany({
    where: { role: 'BPH', isActive: true, id: { not: proposer.id } },
    select: { id: true },
  })
  if (bphs.length === 0) return
  await prisma.notification.createMany({
    data: bphs.map((b) => ({
      userId: b.id,
      title: 'Pengajuan proker baru',
      message: `"${prokerName}" dari ${proposer.name} menunggu persetujuan Anda.`,
      link: '/proker',
    })),
  })
}
