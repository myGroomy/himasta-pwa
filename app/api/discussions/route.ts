import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/discussions?divisionId=...
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const divisionId = searchParams.get('divisionId')

    if (!divisionId) return NextResponse.json({ error: 'divisionId required' }, { status: 400 })

    const threads = await prisma.discussionThread.findMany({
      where: { divisionId },
      include: {
        author: { select: { name: true, role: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    })

    return NextResponse.json({ threads })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/discussions
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { title, content, divisionId } = body

    if (!title?.trim() || !content?.trim() || !divisionId) {
      return NextResponse.json({ error: 'Title, konten, dan divisi wajib diisi' }, { status: 400 })
    }

    // BOLA: cek scope divisi. Non-BPH hanya boleh post ke divisi sendiri.
    const user = session.user as { id: string; role: string; divisionId?: string | null }
    if (user.role !== 'BPH' && user.divisionId !== divisionId) {
      return NextResponse.json({ error: 'Anda hanya dapat berdiskusi di divisi sendiri' }, { status: 403 })
    }

    const thread = await prisma.discussionThread.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        divisionId,
        authorId: session.user.id,
      },
      include: {
        author: { select: { name: true, role: true } },
        _count: { select: { replies: true } },
      },
    })

    return NextResponse.json({ thread })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
