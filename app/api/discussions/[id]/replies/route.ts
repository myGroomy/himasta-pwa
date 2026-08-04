import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/discussions/[id]/replies
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const thread = await prisma.discussionThread.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, role: true } },
        replies: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!thread) return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })

    return NextResponse.json({ thread })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/discussions/[id]/replies
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const thread = await prisma.discussionThread.findUnique({ where: { id: params.id } })
    if (!thread) return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 })

    const body = await req.json()
    const { content } = body

    if (!content?.trim() || content.length < 2) {
      return NextResponse.json({ error: 'Konten balasan terlalu pendek' }, { status: 400 })
    }

    const reply = await prisma.discussionReply.create({
      data: {
        threadId: params.id,
        authorId: session.user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, role: true } },
      },
    })

    // Update thread updatedAt
    await prisma.discussionThread.update({
      where: { id: params.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
