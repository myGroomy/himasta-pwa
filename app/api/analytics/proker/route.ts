import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['BPH', 'KADIV'])

    const { searchParams } = new URL(req.url)
    const divisionId = searchParams.get('divisionId')

    const prokers = await prisma.proker.findMany({
      where: {
        ...(divisionId ? { divisionId } : {}),
      },
      include: {
        division: { select: { id: true, name: true } },
        tasks: { select: { status: true } },
        _count: { select: { tasks: true } },
      },
    })

    // Status distribution
    const statusDist = {
      RENCANA: 0,
      BERJALAN: 0,
      SELESAI: 0,
      DIBATALKAN: 0,
    } as Record<string, number>

    for (const p of prokers) {
      statusDist[p.status] = (statusDist[p.status] ?? 0) + 1
    }

    // Per division summary
    const byDivision: Record<string, {
      divisionId: string
      divisionName: string
      total: number
      selesai: number
      berjalan: number
      rencana: number
      dibatalkan: number
      taskTotal: number
      taskSelesai: number
    }> = {}

    for (const p of prokers) {
      const key = p.divisionId
      const dname = p.division?.name ?? 'Unknown'
      if (!byDivision[key]) {
        byDivision[key] = { divisionId: key, divisionName: dname, total: 0, selesai: 0, berjalan: 0, rencana: 0, dibatalkan: 0, taskTotal: 0, taskSelesai: 0 }
      }
      byDivision[key].total++
      if (p.status === 'SELESAI') byDivision[key].selesai++
      else if (p.status === 'BERJALAN') byDivision[key].berjalan++
      else if (p.status === 'RENCANA') byDivision[key].rencana++
      else byDivision[key].dibatalkan++

      byDivision[key].taskTotal += p._count.tasks
      byDivision[key].taskSelesai += p.tasks.filter(t => t.status === 'SELESAI').length
    }

    const completionRate = prokers.length > 0
      ? Math.round((statusDist['SELESAI'] / prokers.length) * 100)
      : 0

    return NextResponse.json({
      statusDistribution: Object.entries(statusDist).map(([name, value]) => ({ name, value })),
      byDivision: Object.values(byDivision),
      totalProker: prokers.length,
      completionRate,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
