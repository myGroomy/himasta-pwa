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
  name: z.string().min(3, 'Nama event minimal 3 karakter').max(200),
  description: z.string().max(3000).optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  capacity: z.coerce.number().int().positive().nullable().optional(),
  visibility: z.enum(['INTERNAL', 'PUBLIC']).default('INTERNAL'),
  divisionId: z.string().nullable().optional(),
})

const EVENT_INCLUDE = {
  division: { select: { id: true, name: true, slug: true } },
  createdBy: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
  _count: { select: { registrations: true } },
}

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const events = await prisma.event.findMany({
    where:
      user.role === 'BPH'
        ? {}
        : user.role === 'KADIV'
        ? {
            OR: [
              { divisionId: user.divisionId ?? undefined },
              { visibility: 'PUBLIC', status: 'PUBLISHED' },
            ],
          }
        : { visibility: 'PUBLIC', status: 'PUBLISHED' },
    include: EVENT_INCLUDE,
    orderBy: { startTime: 'asc' },
    take: 200,
  })
  const serialized = events.map((e) => ({
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime?.toISOString() ?? null,
    publishedAt: e.publishedAt?.toISOString() ?? null,
    approvedAt: e.approvedAt?.toISOString() ?? null,
    isUpcoming: e.startTime > now,
  }))
  return NextResponse.json({ events: serialized })
}

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { name, description, startTime, endTime, location, capacity, visibility, divisionId } =
    parsed.data

  if (user.role === 'KADIV' && divisionId && divisionId !== user.divisionId) {
    return forbidden('Kadiv hanya bisa membuat event divisi sendiri')
  }

  // Event publik dari divisi butuh approval BPH; internal & semua event BPH tayang langsung
  const needsApproval = user.role !== 'BPH' && visibility === 'PUBLIC'
  const status = needsApproval ? 'PENDING_APPROVAL' : 'PUBLISHED'

  try {
    const event = await prisma.event.create({
      data: {
        name,
        description: description ?? null,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location: location ?? null,
        capacity: capacity ?? null,
        visibility,
        status,
        divisionId: divisionId ?? (user.role === 'KADIV' ? user.divisionId : null),
        createdById: user.id,
        approvedById: status === 'PUBLISHED' ? user.id : null,
        approvedAt: status === 'PUBLISHED' ? new Date() : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: EVENT_INCLUDE,
    })

    if (status === 'PENDING_APPROVAL') {
      await notifyBphNewEvent(user, event.name)
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}

async function notifyBphNewEvent(creator: SessionUser, eventName: string) {
  const bphs = await prisma.user.findMany({
    where: { role: 'BPH', isActive: true, id: { not: creator.id } },
    select: { id: true },
  })
  if (bphs.length === 0) return
  await prisma.notification.createMany({
    data: bphs.map((b) => ({
      userId: b.id,
      title: 'Event menunggu approval',
      message: `"${eventName}" dari ${creator.name} menunggu persetujuan untuk tayang publik.`,
      link: '/admin/approval',
    })),
  })
}
