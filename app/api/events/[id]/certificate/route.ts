import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, notFound, forbidden, serverError } from '@/lib/api'
import type { SessionUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession()
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const { searchParams } = new URL(req.url)
  const registrationId = searchParams.get('registrationId')

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        startTime: true,
        location: true,
        division: { select: { name: true } },
      },
    })

    if (!event) return notFound('Event tidak ditemukan')

    let registration

    if (registrationId) {
      // Pengurus / BPH melihat sertifikat peserta tertentu
      registration = await prisma.eventRegistration.findUnique({
        where: { id: registrationId },
      })
    } else {
      // Anggota melihat sertifikat miliknya sendiri
      registration = await prisma.eventRegistration.findFirst({
        where: {
          eventId: params.id,
          userId: user.id,
        },
      })
    }

    if (!registration) {
      return notFound('Data pendaftaran event tidak ditemukan')
    }

    if (!registration.attended) {
      return forbidden('Sertifikat hanya dapat diunduh jika peserta telah menghadiri event')
    }

    return NextResponse.json({
      certificate: {
        certificateNumber: `CERT/HIMASTA/${event.id.slice(-5).toUpperCase()}/${registration.id.slice(-5).toUpperCase()}`,
        recipientName: registration.name,
        eventName: event.name,
        eventDate: event.startTime.toISOString(),
        organizer: event.division ? `Divisi ${event.division.name}` : 'HIMASTA',
        issuedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    return serverError(error)
  }
}
