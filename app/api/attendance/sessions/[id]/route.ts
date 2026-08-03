import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, notFound, serverError, forbidden } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.attendanceSession.findUnique({
    where: { id: params.id },
    include: {
      division: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true } },
      records: {
        include: {
          user: { select: { id: true, name: true, nim: true } },
        },
        orderBy: { scannedAt: 'asc' },
      },
    },
  })

  if (!session) return notFound()

  const canViewRecords =
    user.role === 'BPH' ||
    (user.role === 'KADIV' &&
      (session.divisionId === user.divisionId || session.divisionId === null))

  if (!canViewRecords) {
    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        divisionId: session.divisionId,
        division: session.division,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
      },
      myAttendance: session.records.find((r) => r.userId === user.id) ?? null,
      canViewRecords: false,
    })
  }

  return NextResponse.json({
    session,
    myAttendance: session.records.find((r) => r.userId === user.id) ?? null,
    canViewRecords: true,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.attendanceSession.findUnique({ where: { id: params.id } })
  if (!session) return notFound()

  const canManage =
    user.role === 'BPH' ||
    (user.role === 'KADIV' &&
      (session.divisionId === user.divisionId || session.divisionId === null))

  if (!canManage) return forbidden()

  const body = await req.json().catch(() => null)
  const isActive = typeof body?.isActive === 'boolean' ? body.isActive : undefined

  try {
    const updated = await prisma.attendanceSession.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(body?.endTime ? { endTime: new Date(body.endTime) } : {}),
      },
    })
    return NextResponse.json({ session: updated })
  } catch (error) {
    return serverError(error)
  }
}
