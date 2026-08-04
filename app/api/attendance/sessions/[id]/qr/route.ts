import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { getApiSession, notFound, serverError, forbidden } from '@/lib/api'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await prisma.attendanceSession.findUnique({ where: { id: params.id } })
  if (!session) return notFound()

  const canGenerate =
    user.role === 'BPH' ||
    (user.role === 'KADIV' &&
      (session.divisionId === user.divisionId || session.divisionId === null))

  if (!canGenerate) return forbidden()

  if (!session.isActive) {
    return NextResponse.json({ error: 'Sesi sudah ditutup, QR tidak aktif' }, { status: 400 })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin
  const scanUrl = `${baseUrl}/kegiatan/scan?token=${encodeURIComponent(session.qrToken)}`

  try {
    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    })
    return NextResponse.json({
      qrDataUrl,
      scanUrl,
      token: session.qrToken,
      session: {
        id: session.id,
        title: session.title,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
      },
    })
  } catch (error) {
    return serverError(error)
  }
}
