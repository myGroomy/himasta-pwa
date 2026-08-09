import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/announcements/[id]/react — toggle reaksi 👍
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!announcement) return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })

  const existing = await prisma.announcementReaction.findUnique({
    where: {
      announcementId_userId: { announcementId: params.id, userId: session.user.id },
    },
  })

  if (existing) {
    await prisma.announcementReaction.delete({ where: { id: existing.id } })
  } else {
    await prisma.announcementReaction.create({
      data: { announcementId: params.id, userId: session.user.id },
    })
  }

  const count = await prisma.announcementReaction.count({ where: { announcementId: params.id } })
  return NextResponse.json({ reacted: !existing, count })
}
