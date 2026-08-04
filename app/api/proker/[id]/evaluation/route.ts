import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/proker/[id]/evaluation
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['KADIV', 'BPH'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proker = await prisma.proker.findUnique({ where: { id: params.id } })
    if (!proker) return NextResponse.json({ error: 'Proker tidak ditemukan' }, { status: 404 })
    if (proker.status !== 'SELESAI') {
      return NextResponse.json({ error: 'Evaluasi hanya untuk proker berstatus SELESAI' }, { status: 400 })
    }

    const activePeriod = await prisma.period.findFirst({ where: { isActive: true } })
    if (!activePeriod) {
      return NextResponse.json({ error: 'Tidak ada periode aktif' }, { status: 400 })
    }

    const body = await req.json()
    const { whatWorked, whatFailed, lessons, overallRating } = body

    if (!whatWorked || !whatFailed || !lessons || !overallRating) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json({ error: 'Rating harus 1-5' }, { status: 400 })
    }

    const evaluation = await prisma.prokerEvaluation.upsert({
      where: { prokerId: params.id },
      create: {
        prokerId: params.id,
        periodId: activePeriod.id,
        authorId: session.user.id,
        whatWorked,
        whatFailed,
        lessons,
        overallRating: Number(overallRating),
      },
      update: {
        whatWorked,
        whatFailed,
        lessons,
        overallRating: Number(overallRating),
        authorId: session.user.id,
      },
    })

    return NextResponse.json({ evaluation })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET /api/proker/[id]/evaluation
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const evaluation = await prisma.prokerEvaluation.findUnique({
      where: { prokerId: params.id },
      include: {
        author: { select: { name: true } },
        period: { select: { name: true } },
      },
    })

    return NextResponse.json({ evaluation })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
