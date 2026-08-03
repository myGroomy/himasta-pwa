import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, serverError } from '@/lib/api'
import type { AnnouncementStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'BPH') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const q = searchParams.get('q') || undefined

  const statusFilter: AnnouncementStatus[] | undefined =
    status === 'PUBLISHED' || status === 'REJECTED'
      ? [status]
      : ['PUBLISHED', 'REJECTED']

  try {
    const logs = await prisma.approvalLog.findMany({
      where: {
        announcement: {
          status: { in: statusFilter },
          ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
        },
      },
      include: {
        actor: { select: { id: true, name: true } },
        announcement: {
          select: {
            id: true,
            title: true,
            status: true,
            scope: true,
            rejectionReason: true,
            publishedAt: true,
            author: { select: { name: true } },
            division: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json({ logs })
  } catch (error) {
    return serverError(error)
  }
}
