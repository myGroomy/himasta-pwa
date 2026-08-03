import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, notFound, serverError } from '@/lib/api'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const notification = await prisma.notification.findUnique({ where: { id: params.id } })
    if (!notification || notification.userId !== user.id) return notFound('Notifikasi tidak ditemukan')

    const body = await req.json().catch(() => null)
    const isRead = typeof body?.isRead === 'boolean' ? body.isRead : true

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead },
    })
    return NextResponse.json({ notification: updated })
  } catch (error) {
    return serverError(error)
  }
}

export async function PATCH(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const notification = await prisma.notification.findUnique({ where: { id: params.id } })
    if (!notification || notification.userId !== user.id) return notFound('Notifikasi tidak ditemukan')

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    })
    return NextResponse.json({ notification: updated })
  } catch (error) {
    return serverError(error)
  }
}
