import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['BPH'])

    const { searchParams } = new URL(req.url)
    const divisionId = searchParams.get('divisionId')
    const limit = parseInt(searchParams.get('limit') ?? '20')

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ['ANGGOTA', 'KADIV'] },
        ...(divisionId ? { divisionId } : {}),
      },
      include: {
        division: { select: { name: true } },
        attendanceRecords: {
          select: { status: true },
        },
        tasksAssigned: {
          select: { status: true },
        },
        prokersLed: {
          select: { status: true },
        },
      },
      take: limit,
    })

    const memberStats = users.map(u => {
      const totalAttendance = u.attendanceRecords.length
      const hadirCount = u.attendanceRecords.filter(r => r.status === 'HADIR').length
      const hadirRate = totalAttendance > 0 ? Math.round((hadirCount / totalAttendance) * 100) : 0

      const totalTasks = u.tasksAssigned.length
      const taskSelesai = u.tasksAssigned.filter(t => t.status === 'SELESAI').length

      const prokerLed = u.prokersLed.length
      const prokerSelesai = u.prokersLed.filter(p => p.status === 'SELESAI').length

      // Composite score (weighted)
      const score = Math.round(hadirRate * 0.5 + (totalTasks > 0 ? (taskSelesai / totalTasks) * 100 : 0) * 0.5)

      return {
        id: u.id,
        name: u.name,
        division: u.division?.name ?? '-',
        totalAttendance,
        hadirCount,
        hadirRate,
        totalTasks,
        taskSelesai,
        prokerLed,
        prokerSelesai,
        score,
      }
    }).sort((a, b) => b.score - a.score)

    return NextResponse.json({ members: memberStats })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
