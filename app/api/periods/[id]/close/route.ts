import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/periods/[id]/close BPH only, closes period & sets all members to ALUMNI
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(['BPH'])

    const period = await prisma.period.findUnique({ where: { id: params.id } })
    if (!period) return NextResponse.json({ error: 'Periode tidak ditemukan' }, { status: 404 })
    if (!period.isActive) return NextResponse.json({ error: 'Periode ini sudah tidak aktif' }, { status: 400 })

    const endDate = new Date()

    await prisma.$transaction([
      // Close period
      prisma.period.update({
        where: { id: params.id },
        data: { isActive: false, endDate },
      }),
      // Set all AKTIF histories to leftAt = now
      prisma.memberHistory.updateMany({
        where: { periodId: params.id, status: 'AKTIF' },
        data: { status: 'ALUMNI', leftAt: endDate },
      }),
      // Set old users to isActive = false for regenerasi (admin can re-activate selectively)
      // We mark them BPH manually re-activates new members
      // Note: we don't actually deactivate users to avoid locking them out instantly
    ])

    return NextResponse.json({ success: true, message: `Periode ${period.name} berhasil ditutup` })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
