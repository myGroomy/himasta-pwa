import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession, notFound, serverError, forbidden } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.attendanceSession.findUnique({
    where: { id: params.id },
    include: {
      division: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true } },
      records: {
        include: {
          user: { select: { id: true, name: true, nim: true } },
        },
        orderBy: { scannedAt: 'asc' },
      },
    },
  })

  if (!session) return notFound()

  const canViewRecords =
    user.role === 'BPH' ||
    (user.role === 'KADIV' &&
      (session.divisionId === user.divisionId || session.divisionId === null))

  if (!canViewRecords) {
    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        divisionId: session.divisionId,
        division: session.division,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
      },
      myAttendance: session.records.find((r) => r.userId === user.id) ?? null,
      canViewRecords: false,
    })
  }

  return NextResponse.json({
    session,
    myAttendance: session.records.find((r) => r.userId === user.id) ?? null,
    canViewRecords: true,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.attendanceSession.findUnique({ where: { id: params.id } })
  if (!session) return notFound()

  const canManage =
    user.role === 'BPH' ||
    (user.role === 'KADIV' &&
      (session.divisionId === user.divisionId || session.divisionId === null))

  if (!canManage) return forbidden()

  const body = await req.json().catch(() => null)
  const isActive = typeof body?.isActive === 'boolean' ? body.isActive : undefined

  try {
    const updated = await prisma.attendanceSession.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(body?.endTime ? { endTime: new Date(body.endTime) } : {}),
      },
    })

    // V2: saat sesi ditutup, rekap status kehadiran lengkap (Hadir / Izin / Tanpa Keterangan)
    if (isActive === false) {
      await reconcileAttendance(session)
    }

    return NextResponse.json({ session: updated })
  } catch (error) {
    return serverError(error)
  }
}

// Rekap: anggota divisi tanpa catatan → TANPA_KETERANGAN, kecuali punya izin disetujui → IZIN
async function reconcileAttendance(session: {
  id: string
  title: string
  divisionId: string | null
}) {
  const members = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { not: 'DOSEN' },
      ...(session.divisionId ? { divisionId: session.divisionId } : {}),
    },
    select: { id: true },
  })
  if (members.length === 0) return

  const existing = await prisma.attendanceRecord.findMany({
    where: { sessionId: session.id },
    select: { userId: true },
  })
  const presentIds = new Set(existing.map((r) => r.userId))
  const absent = members.filter((m) => !presentIds.has(m.id))
  if (absent.length === 0) return

  // Izin yang disetujui utk sesi ini (match via sessionId atau judul kegiatan)
  const approvedPerms = await prisma.permission.findMany({
    where: {
      status: 'DISETUJUI',
      requesterId: { in: absent.map((m) => m.id) },
      OR: [{ sessionId: session.id }, { sessionTitle: session.title }],
    },
    select: { requesterId: true },
  })
  const izinIds = new Set(approvedPerms.map((p) => p.requesterId))

  await prisma.attendanceRecord.createMany({
    data: absent.map((m) => ({
      sessionId: session.id,
      userId: m.id,
      status: izinIds.has(m.id) ? 'IZIN' : 'TANPA_KETERANGAN',
    })),
  })
}
