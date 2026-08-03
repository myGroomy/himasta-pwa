import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, serverError } from '@/lib/api'

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const records = await prisma.attendanceRecord.findMany({
      where: { userId: user.id },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            startTime: true,
            division: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { scannedAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ records })
  } catch (error) {
    return serverError(error)
  }
}
