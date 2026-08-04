import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { badRequest, notFound, serverError } from '@/lib/api'
import { z } from 'zod'

// Form pendaftaran tanpa akun untuk peserta eksternal (sertifikat/konsumsi)
const externalSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2, 'Nama minimal 2 karakter').max(200),
  email: z.string().email('Email tidak valid').max(200),
  phone: z.string().max(30).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = externalSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { eventId, name, email, phone } = parsed.data

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, status: true, capacity: true, _count: { select: { registrations: true } } },
  })
  if (!event) return notFound('Event tidak ditemukan')
  if (event.status !== 'PUBLISHED') return badRequest('Event belum tayang')
  if (event.capacity && event._count.registrations >= event.capacity) {
    return badRequest('Kuota event sudah penuh')
  }

  try {
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId: event.id, email },
    })
    if (existing) return badRequest('Email ini sudah terdaftar di event')

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        name,
        email,
        phone: phone ?? null,
        qrToken: randomBytes(16).toString('hex'),
      },
    })
    return NextResponse.json(
      {
        registration,
        message: 'Pendaftaran berhasil. Simpan QR ini untuk absensi saat event.',
      },
      { status: 201 }
    )
  } catch (error) {
    return serverError(error)
  }
}
