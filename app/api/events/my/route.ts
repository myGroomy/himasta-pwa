import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse } from '@/lib/api'
import type { SessionUser } from '@/lib/auth'

export async function GET() {
  const result = await requireApiSession()
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const registrations = await prisma.eventRegistration.findMany({
    where: { userId: user.id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          location: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  const serialized = registrations.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    event: {
      ...r.event,
      startTime: r.event.startTime.toISOString(),
      endTime: r.event.endTime?.toISOString() ?? null,
    },
  }))
  return NextResponse.json({ registrations: serialized })
}
