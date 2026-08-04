import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest, notFound, serverError } from '@/lib/api'
import { z } from 'zod'

// Absensi peserta event via QR token. Member bisa lewat akun (auto resolve),
// eksternal lewat token yang diterima saat daftar. Check-in oleh kadiv/BPH.
const checkInSchema = z.object({
  token: z.string().min(8, 'Token QR tidak valid'),
})

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result

  const body = await req.json().catch(() => null)
  const parsed = checkInSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const registration = await prisma.eventRegistration.findUnique({
    where: { qrToken: parsed.data.token },
    include: { event: { select: { id: true, name: true } } },
  })
  if (!registration) return notFound('QR tidak terdaftar untuk event manapun')

  try {
    const updated = await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { attended: true },
      include: { event: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ registration: updated })
  } catch (error) {
    return serverError(error)
  }
}
