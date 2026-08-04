import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/events/[id]/survey
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await prisma.event.findUnique({ where: { id: params.id } })
    if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })

    const body = await req.json()
    const { rating, comment, isAnon } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating harus 1-5' }, { status: 400 })
    }

    const existing = await prisma.eventSurvey.findUnique({
      where: { eventId_userId: { eventId: params.id, userId: session.user.id } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Kamu sudah mengisi survey ini' }, { status: 409 })
    }

    const survey = await prisma.eventSurvey.create({
      data: {
        eventId: params.id,
        userId: isAnon ? null : session.user.id,
        rating: Number(rating),
        comment: comment?.trim() ?? null,
        isAnon: Boolean(isAnon),
      },
    })

    return NextResponse.json({ survey })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET /api/events/[id]/survey BPH/KADIV only
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['KADIV', 'BPH'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const surveys = await prisma.eventSurvey.findMany({
      where: { eventId: params.id },
      include: {
        user: { select: { name: true, nim: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = surveys.length
    const avgRating = total > 0 ? surveys.reduce((s, r) => s + r.rating, 0) / total : 0
    const dist = [1, 2, 3, 4, 5].map(r => ({
      rating: r,
      count: surveys.filter(s => s.rating === r).length,
    }))

    const sanitized = surveys.map(s => ({
      ...s,
      user: s.isAnon ? null : s.user,
      userId: s.isAnon ? null : s.userId,
    }))

    return NextResponse.json({ surveys: sanitized, total, avgRating: Math.round(avgRating * 10) / 10, distribution: dist })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
