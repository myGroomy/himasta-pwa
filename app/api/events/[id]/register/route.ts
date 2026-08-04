import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const bodyText = await req.text()

    let parsedBody: any = {}
    if (bodyText) {
      try {
        parsedBody = JSON.parse(bodyText)
      } catch (e) {
        return NextResponse.json({ error: 'Format data tidak valid' }, { status: 400 })
      }
    }

    const eventId = params.id

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
    }

    if (event.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Event belum dipublikasi' }, { status: 400 })
    }

    if (event.visibility === 'INTERNAL' && !session) {
      return NextResponse.json({ error: 'Event ini khusus internal. Silakan login terlebih dahulu.' }, { status: 403 })
    }

    if (event.capacity && event.registrations.length >= event.capacity) {
      return NextResponse.json({ error: 'Kuota pendaftaran event ini sudah penuh' }, { status: 400 })
    }

    let userId: string | null = null
    let name = parsedBody.name
    let email = parsedBody.email
    let phone = parsedBody.phone || null
    let institution = parsedBody.institution || null

    if (session?.user?.id) {
      // Anggota yang login: daftar otomatis dari data akun bila body kosong
      userId = session.user.id
      if (!name || !email) {
        const dbUser = await prisma.user.findUnique({ where: { id: userId } })
        name = dbUser?.name || session.user.name || null
        email = dbUser?.email || session.user.email || null
        phone = phone || dbUser?.phone || null
      }
      if (!name || !email) {
        return NextResponse.json({ error: 'Profil Anda belum lengkap. Isi nama dan email di halaman profil.' }, { status: 400 })
      }
    } else if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Nama, Email, dan No. HP wajib diisi' }, { status: 400 })
    }

    // Cek apakah sudah pernah mendaftar
    const existingReg = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        OR: [
          ...(userId ? [{ userId }] : []),
          { email },
        ],
      },
    })

    if (existingReg) {
      return NextResponse.json({ error: 'Anda sudah terdaftar di event ini' }, { status: 400 })
    }

    // Generate unique QR token: evt_[eventId]_[randomString]
    const randomString = crypto.randomBytes(4).toString('hex')
    const qrToken = `evt_${eventId.substring(0, 8)}_${randomString}`

    const newReg = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        name,
        email,
        phone,
        institution,
        qrToken,
      },
    })

    return NextResponse.json({
      message: 'Registrasi berhasil',
      qrToken: newReg.qrToken,
      name: newReg.name,
    }, { status: 201 })

  } catch (error: any) {
    console.error('Event registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
