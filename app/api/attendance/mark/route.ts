import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest, notFound } from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const markSchema = z.object({
  memberToken: z.string().min(8, 'QR pribadi tidak valid'),
  sessionId: z.string().min(1, 'Kegiatan tidak valid'),
})

export async function POST(req: NextRequest) {
  // Hanya BPH/Kadiv yang boleh menandai kehadiran peserta lain.
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const scanner = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = markSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'QR tidak valid')

  const { memberToken, sessionId } = parsed.data

  const session = await prisma.attendanceSession.findUnique({ where: { id: sessionId } })
  if (!session) return notFound('Kegiatan tidak ditemukan')
  if (!session.isActive) return badRequest('Kegiatan ini sudah ditutup.')
  if (session.endTime && session.endTime < new Date()) {
    return badRequest('Kegiatan sudah berakhir.')
  }

  const member = await prisma.user.findUnique({ where: { qrToken: memberToken } })
  if (!member) return badRequest('QR pribadi tidak dikenal.')
  if (!member.isActive || member.role === 'DOSEN') {
    return badRequest('Anggota tidak aktif, tidak dapat dicatat kehadirannya.')
  }
  if (session.divisionId && member.divisionId !== session.divisionId) {
    return badRequest('Anggota bukan bagian dari divisi kegiatan ini.')
  }

  try {
    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        userId: member.id,
        status: 'HADIR',
      },
    })

    await prisma.notification.create({
      data: {
        userId: member.id,
        title: 'Kehadiran tercatat',
        message: `${scanner.name} mencatat kehadiran Anda pada "${session.title}".`,
        link: `/kegiatan`,
      },
    })

    return NextResponse.json({
      ok: true,
      record,
      member: { id: member.id, name: member.name },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: `${member.name} sudah tercatat hadir pada kegiatan ini.`, already: true },
        { status: 409 }
      )
    }
    throw error
  }
}
