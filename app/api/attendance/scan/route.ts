import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest } from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'
import { Prisma } from '@prisma/client'

const scanSchema = z.object({
  token: z.string().min(8, 'QR token tidak valid'),
})

export async function POST(req: NextRequest) {
  const result = await requireApiSession()
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = scanSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'QR tidak valid')

  const session = await prisma.attendanceSession.findUnique({
    where: { qrToken: parsed.data.token },
  })

  if (!session) return badRequest('QR tidak dikenal. Pastikan QR berasal dari sesi yang valid.')
  if (!session.isActive) return badRequest('Sesi absensi ini sudah ditutup.')
  if (session.endTime && session.endTime < new Date()) {
    return badRequest('Sesi absensi sudah berakhir.')
  }
  if (session.divisionId && session.divisionId !== user.divisionId && user.role !== 'BPH') {
    return badRequest('Anda bukan anggota divisi sesi ini.')
  }

  try {
    const record = await prisma.$transaction(async (tx) => {
      const rec = await tx.attendanceRecord.create({
        data: {
          sessionId: session.id,
          userId: user.id,
        },
        include: {
          session: { select: { id: true, title: true } },
        },
      })

      await tx.notification.create({
        data: {
          userId: session.createdById,
          title: 'Kehadiran tercatat',
          message: `${user.name} telah melakukan absensi pada "${session.title}".`,
          link: `/kegiatan`,
        },
      })

      return rec
    })

    return NextResponse.json({ ok: true, record })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi pada sesi ini.', already: true },
        { status: 409 }
      )
    }
    throw error
  }
}
