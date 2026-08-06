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

    try {
      const result = await prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
          where: { id: eventId },
        })

        if (!event) throw new Error('NOT_FOUND')
        if (event.status !== 'PUBLISHED') throw new Error('NOT_PUBLISHED')

        if (event.visibility === 'INTERNAL' && !session) {
          throw new Error('INTERNAL_ONLY')
        }

        const regCount = await tx.eventRegistration.count({
          where: { eventId }
        })

        if (event.capacity && regCount >= event.capacity) {
          throw new Error('CAPACITY_FULL')
        }

        let userId: string | null = null
        let name = parsedBody.name
        let email = parsedBody.email
        let phone = parsedBody.phone || null
        let institution = parsedBody.institution || null

        if (session?.user?.id) {
          userId = session.user.id
          if (!name || !email) {
            const dbUser = await tx.user.findUnique({ where: { id: userId } })
            name = dbUser?.name || session.user.name || null
            email = dbUser?.email || session.user.email || null
            phone = phone || dbUser?.phone || null
          }
          if (!name || !email) {
            throw new Error('PROFILE_INCOMPLETE')
          }
        } else if (!name || !email || !phone) {
          throw new Error('MISSING_FIELDS')
        }

        const existingReg = await tx.eventRegistration.findFirst({
          where: {
            eventId,
            OR: [
              ...(userId ? [{ userId }] : []),
              { email },
            ],
          },
        })

        if (existingReg) {
          throw new Error('ALREADY_REGISTERED')
        }

        const randomString = crypto.randomBytes(16).toString('hex')
        const qrToken = `evt_${eventId.substring(0, 8)}_${randomString}`

        return await tx.eventRegistration.create({
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
      })

      return NextResponse.json({
        message: 'Registrasi berhasil',
        qrToken: result.qrToken,
        name: result.name,
      }, { status: 201 })

    } catch (txError: any) {
      if (txError.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
      }
      if (txError.message === 'NOT_PUBLISHED') {
        return NextResponse.json({ error: 'Event belum dipublikasi' }, { status: 400 })
      }
      if (txError.message === 'INTERNAL_ONLY') {
        return NextResponse.json({ error: 'Event ini khusus internal. Silakan login terlebih dahulu.' }, { status: 403 })
      }
      if (txError.message === 'CAPACITY_FULL') {
        return NextResponse.json({ error: 'Kuota pendaftaran event ini sudah penuh' }, { status: 400 })
      }
      if (txError.message === 'PROFILE_INCOMPLETE') {
        return NextResponse.json({ error: 'Profil Anda belum lengkap. Isi nama dan email di halaman profil.' }, { status: 400 })
      }
      if (txError.message === 'MISSING_FIELDS') {
        return NextResponse.json({ error: 'Nama, Email, dan No. HP wajib diisi' }, { status: 400 })
      }
      if (txError.message === 'ALREADY_REGISTERED') {
        return NextResponse.json({ error: 'Anda sudah terdaftar di event ini' }, { status: 400 })
      }
      throw txError
    }

  } catch (error: any) {
    console.error('Event registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
