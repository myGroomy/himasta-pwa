import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, notFound, serverError } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const announcement = await prisma.announcement.findFirst({
    where: {
      id: params.id,
      status: 'PUBLISHED',
      ...(user.role === 'BPH'
        ? {}
        : user.role === 'DOSEN'
        ? { visibleToDosen: true }
        : {
            OR: [
              { scope: 'GENERAL' },
              ...(user.divisionId ? [{ scope: 'DIVISION' as const, divisionId: user.divisionId }] : []),
            ],
          }),
    },
    include: {
      author: { select: { id: true, name: true, email: true, role: true } },
      division: { select: { id: true, name: true, slug: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  })

  if (!announcement) return notFound()
  return NextResponse.json({ announcement })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const announcement = await prisma.announcement.findUnique({ where: { id: params.id } })
  if (!announcement) return notFound()

  const isOwner = announcement.authorId === user.id
  const canDelete =
    user.role === 'BPH' ||
    (user.role === 'KADIV' && isOwner && announcement.scope === 'DIVISION')

  if (!canDelete) {
    return NextResponse.json({ error: 'Anda tidak berhak menghapus pengumuman ini' }, { status: 403 })
  }

  try {
    await prisma.announcement.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return serverError(error)
  }
}
