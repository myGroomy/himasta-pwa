import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest, serverError } from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const createSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(150),
  description: z.string().max(500).optional().nullable(),
  category: z
    .enum(['RAPAT', 'MAKRAB', 'MUBES', 'PROKER', 'LAINNYA'])
    .optional(),
  divisionId: z.string().nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional().nullable(),
})

export async function GET() {
  const user = await getApiUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (user.role === 'DOSEN') return NextResponse.json({ sessions: [] })

  const sessions = await prisma.attendanceSession.findMany({
    where: buildSessionScope(user),
    include: {
      division: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { records: true } },
    },
    orderBy: { startTime: 'desc' },
    take: 100,
  })
  return NextResponse.json({ sessions })
}

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { title, description, category, divisionId, startTime, endTime } = parsed.data

  if (divisionId && user.role === 'KADIV' && divisionId !== user.divisionId) {
    return NextResponse.json({ error: 'Kadiv hanya bisa membuat sesi untuk divisi sendiri' }, { status: 403 })
  }

  const token = randomBytes(24).toString('hex')

  try {
    const session = await prisma.attendanceSession.create({
      data: {
        title,
        description: description ?? null,
        category: category ?? 'RAPAT',
        divisionId: divisionId ?? null,
        qrToken: token,
        createdById: user.id,
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : null,
      },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}

async function getApiUser() {
  const result = await requireApiSession()
  if (isApiResponse(result)) return null
  return result as SessionUser
}

function buildSessionScope(user: SessionUser) {
  if (user.role === 'BPH') return {}
  return user.divisionId ? { OR: [{ divisionId: user.divisionId }, { divisionId: null }] } : {}
}
