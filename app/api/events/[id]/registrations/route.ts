import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireApiSession,
  isApiResponse,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api'
import type { SessionUser } from '@/lib/auth'

// Daftar peserta + toggle kehadiran (organizer event)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { id: true, divisionId: true, createdById: true },
  })
  if (!event) return notFound('Event tidak ditemukan')
  if (user.role === 'KADIV' && event.divisionId !== user.divisionId && event.createdById !== user.id) {
    return forbidden('Kadiv hanya bisa melihat peserta event divisi sendiri')
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: event.id },
    include: { user: { select: { id: true, name: true, nim: true } } },
    orderBy: { createdAt: 'asc' },
  })
  const serialized = registrations.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))
  return NextResponse.json({ registrations: serialized })
}

// Toggle kehadiran manual oleh organizer
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { id: true, divisionId: true, createdById: true },
  })
  if (!event) return notFound('Event tidak ditemukan')
  if (user.role === 'KADIV' && event.divisionId !== user.divisionId && event.createdById !== user.id) {
    return forbidden('Kadiv hanya bisa mengelola peserta event divisi sendiri')
  }

  const body = await req.json().catch(() => null)
  const registrationId = body?.registrationId as string | undefined
  const attended = Boolean(body?.attended)
  if (!registrationId) return NextResponse.json({ error: 'registrationId wajib' }, { status: 400 })

  try {
    const registration = await prisma.eventRegistration.update({
      where: { id: registrationId, eventId: event.id },
      data: { attended },
    })
    return NextResponse.json({ registration })
  } catch (error) {
    return serverError(error)
  }
}
