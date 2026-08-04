import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/periods
export async function GET() {
  try {
    await requireRole(['ANGGOTA', 'KADIV', 'BPH', 'DOSEN'])
    const periods = await prisma.period.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { memberHistories: true } },
      },
    })
    return NextResponse.json({ periods })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// POST /api/periods BPH only
export async function POST(req: NextRequest) {
  try {
    await requireRole(['BPH'])
    const body = await req.json()
    const { name, startDate } = body

    if (!name || !startDate) {
      return NextResponse.json({ error: 'Nama dan tanggal mulai wajib diisi' }, { status: 400 })
    }

    const existing = await prisma.period.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: 'Periode dengan nama ini sudah ada' }, { status: 409 })
    }

    // Deactivate all others first, set this as active
    await prisma.period.updateMany({ data: { isActive: false } })

    const period = await prisma.period.create({
      data: {
        name,
        startDate: new Date(startDate),
        isActive: true,
      },
    })

    // Create MemberHistory for all active members in new period
    const activeMembers = await prisma.user.findMany({
      where: { isActive: true, role: { in: ['ANGGOTA', 'KADIV', 'BPH'] } },
      select: { id: true, role: true, divisionId: true },
    })

    await prisma.memberHistory.createMany({
      data: activeMembers.map(m => ({
        userId: m.id,
        periodId: period.id,
        divisionId: m.divisionId,
        role: m.role,
        status: 'AKTIF',
      })),
      skipDuplicates: true,
    })

    return NextResponse.json({ period })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
