import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, serverError } from '@/lib/api'

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ notifications })
  } catch (error) {
    return serverError(error)
  }
}
