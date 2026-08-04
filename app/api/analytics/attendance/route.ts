import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['BPH', 'KADIV'])

    const { searchParams } = new URL(req.url)
    const divisionId = searchParams.get('divisionId')
    const periodId = searchParams.get('periodId')

    // Get attendance sessions with record counts
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        ...(divisionId ? { divisionId } : {}),
      },
      include: {
        division: { select: { id: true, name: true } },
        records: {
          select: { status: true, userId: true },
        },
        _count: { select: { records: true } },
      },
      orderBy: { startTime: 'asc' },
    })

    // Aggregate by division
    const byDivision: Record<string, {
      divisionId: string
      divisionName: string
      totalSessions: number
      totalRecords: number
      hadirCount: number
      izinCount: number
      alphCount: number
    }> = {}

    for (const s of sessions) {
      const key = s.divisionId ?? 'general'
      const dname = s.division?.name ?? 'General'
      if (!byDivision[key]) {
        byDivision[key] = { divisionId: key, divisionName: dname, totalSessions: 0, totalRecords: 0, hadirCount: 0, izinCount: 0, alphCount: 0 }
      }
      byDivision[key].totalSessions++
      byDivision[key].totalRecords += s._count.records
      for (const r of s.records) {
        if (r.status === 'HADIR') byDivision[key].hadirCount++
        else if (r.status === 'IZIN') byDivision[key].izinCount++
        else byDivision[key].alphCount++
      }
    }

    // Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const recentSessions = sessions.filter(s => new Date(s.startTime) >= twelveMonthsAgo)
    const monthlyMap: Record<string, { month: string; hadir: number; izin: number; alph: number }> = {}

    for (const s of recentSessions) {
      const d = new Date(s.startTime)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, hadir: 0, izin: 0, alph: 0 }
      for (const r of s.records) {
        if (r.status === 'HADIR') monthlyMap[key].hadir++
        else if (r.status === 'IZIN') monthlyMap[key].izin++
        else monthlyMap[key].alph++
      }
    }

    const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({
      byDivision: Object.values(byDivision),
      monthly,
      totalSessions: sessions.length,
      totalRecords: sessions.reduce((a, s) => a + s._count.records, 0),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
