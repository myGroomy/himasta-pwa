import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/feedback BPH only list
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'BPH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const periodId = searchParams.get('periodId')

    const feedbacks = await prisma.feedbackBPH.findMany({
      where: periodId ? { periodId } : {},
      include: {
        author: { select: { name: true, nim: true } },
        period: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mask anon authors
    const sanitized = feedbacks.map(f => ({
      ...f,
      author: f.isAnon ? null : f.author,
      authorId: f.isAnon ? null : f.authorId,
    }))

    return NextResponse.json({ feedbacks: sanitized })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/feedback any authenticated user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content, isAnon, periodId } = body

    if (!content?.trim() || content.length < 10) {
      return NextResponse.json({ error: 'Konten feedback terlalu pendek' }, { status: 400 })
    }

    // Get active period if not specified
    let activePeriodId = periodId
    if (!activePeriodId) {
      const activePeriod = await prisma.period.findFirst({ where: { isActive: true } })
      if (!activePeriod) {
        return NextResponse.json({ error: 'Tidak ada periode aktif' }, { status: 400 })
      }
      activePeriodId = activePeriod.id
    }

    const feedback = await prisma.feedbackBPH.create({
      data: {
        content: content.trim(),
        isAnon: Boolean(isAnon),
        authorId: isAnon ? null : session.user.id,
        periodId: activePeriodId,
      },
    })

    return NextResponse.json({ feedback })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
