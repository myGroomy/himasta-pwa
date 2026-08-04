import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await requireRole(['BPH'])

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? 'members'
    const divisionId = searchParams.get('divisionId')

    if (type === 'attendance') {
      const sessions = await prisma.attendanceSession.findMany({
        where: divisionId ? { divisionId } : {},
        include: {
          division: { select: { name: true } },
          records: { select: { status: true, userId: true } },
        },
        orderBy: { startTime: 'asc' },
      })

      const rows = sessions.map(s => ({
        Tanggal: new Date(s.startTime).toLocaleDateString('id-ID'),
        Judul: s.title,
        Divisi: s.division?.name ?? 'General',
        Hadir: s.records.filter(r => r.status === 'HADIR').length,
        Izin: s.records.filter(r => r.status === 'IZIN').length,
        'Tanpa Keterangan': s.records.filter(r => r.status === 'TANPA_KETERANGAN').length,
        Total: s.records.length,
      }))

      return NextResponse.json({ rows, filename: 'rekap-absensi.xlsx' })
    }

    if (type === 'proker') {
      const prokers = await prisma.proker.findMany({
        where: divisionId ? { divisionId } : {},
        include: {
          division: { select: { name: true } },
          pj: { select: { name: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'asc' },
      })

      const rows = prokers.map(p => ({
        'Nama Proker': p.name,
        Divisi: p.division.name,
        Status: p.status,
        'PJ': p.pj?.name ?? '-',
        'Mulai': p.startDate ? new Date(p.startDate).toLocaleDateString('id-ID') : '-',
        'Selesai': p.endDate ? new Date(p.endDate).toLocaleDateString('id-ID') : '-',
        'Jumlah Task': p._count.tasks,
        'Budget Estimasi': p.estimateBudget?.toString() ?? '-',
        'Budget Aktual': p.actualBudget?.toString() ?? '-',
      }))

      return NextResponse.json({ rows, filename: 'rekap-proker.xlsx' })
    }

    // Default: members
    const users = await prisma.user.findMany({
      where: { isActive: true, ...(divisionId ? { divisionId } : {}) },
      include: {
        division: { select: { name: true } },
        attendanceRecords: { select: { status: true } },
        tasksAssigned: { select: { status: true } },
      },
      orderBy: [{ division: { name: 'asc' } }, { name: 'asc' }],
    })

    const rows = users.map(u => ({
      Nama: u.name,
      NIM: u.nim ?? '-',
      Email: u.email,
      Role: u.role,
      Divisi: u.division?.name ?? '-',
      'Total Absensi': u.attendanceRecords.length,
      'Hadir': u.attendanceRecords.filter(r => r.status === 'HADIR').length,
      'Rate Hadir (%)': u.attendanceRecords.length > 0
        ? Math.round((u.attendanceRecords.filter(r => r.status === 'HADIR').length / u.attendanceRecords.length) * 100)
        : 0,
      'Total Task': u.tasksAssigned.length,
      'Task Selesai': u.tasksAssigned.filter(t => t.status === 'SELESAI').length,
    }))

    return NextResponse.json({ rows, filename: 'rekap-anggota.xlsx' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
