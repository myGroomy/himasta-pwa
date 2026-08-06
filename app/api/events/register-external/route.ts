import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { badRequest, notFound, serverError, rateLimited } from '@/lib/api'
import { z } from 'zod'

// Form pendaftaran tanpa akun untuk peserta eksternal (sertifikat/konsumsi)
const externalSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(200),
  email: z.string().email('Email tidak valid').max(200),
  phone: z.string().max(30).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const limited = rateLimited(req, { limit: 10 })
  if (limited) return limited

  const body = await req.json().catch(() => null)
  const parsed = externalSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { eventId, name, email, phone } = parsed.data

  try {
    const registration = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: { id: true, status: true, capacity: true },
      })
      if (!event) throw new Error('NOT_FOUND')
      if (event.status !== 'PUBLISHED') throw new Error('NOT_PUBLISHED')

      const regCount = await tx.eventRegistration.count({
        where: { eventId: event.id }
      })

      if (event.capacity && regCount >= event.capacity) {
        throw new Error('CAPACITY_FULL')
      }

      const existing = await tx.eventRegistration.findFirst({
        where: { eventId: event.id, email },
      })
      if (existing) throw new Error('EMAIL_EXISTS')

      return await tx.eventRegistration.create({
        data: {
          eventId: event.id,
          name,
          email,
          phone: phone ?? null,
          qrToken: randomBytes(16).toString('hex'),
        },
      })
    })

    return NextResponse.json(
      {
        registration,
        message: 'Pendaftaran berhasil. Simpan QR ini untuk absensi saat event.',
      },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return notFound('Event tidak ditemukan')
    if (error.message === 'NOT_PUBLISHED') return badRequest('Event belum tayang')
    if (error.message === 'CAPACITY_FULL') return badRequest('Kuota event sudah penuh')
    if (error.message === 'EMAIL_EXISTS') return badRequest('Email ini sudah terdaftar di event')
    return serverError(error)
  }
}
