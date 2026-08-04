import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { getApiSession, serverError } from '@/lib/api'

export async function GET(req: NextRequest) {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Lazy-create token QR pribadi bila belum ada (backfill user lama).
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })

    let qrToken = dbUser.qrToken
    if (!qrToken) {
      qrToken = randomBytes(24).toString('hex')
      await prisma.user.update({ where: { id: user.id }, data: { qrToken } })
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? req.nextUrl.origin
    const scanUrl = `${baseUrl}/kegiatan/scan?member=${encodeURIComponent(qrToken)}`

    const qrDataUrl = await QRCode.toDataURL(scanUrl, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    })

    return NextResponse.json({ qrToken, qrDataUrl, scanUrl })
  } catch (error) {
    return serverError(error)
  }
}
