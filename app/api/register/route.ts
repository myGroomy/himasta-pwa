import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { serverError } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { name, email, nim, password, divisionId } = json

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, Email, dan Password wajib diisi' }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(nim ? [{ nim }] : [])
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email atau NIM sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        nim: nim || null,
        password: hashedPassword,
        role: 'ANGGOTA',
        divisionId: divisionId || null,
        isActive: false, // Menunggu persetujuan BPH
      },
    })

    // Buat notifikasi ke BPH
    const bphUsers = await prisma.user.findMany({ where: { role: 'BPH' } })
    if (bphUsers.length > 0) {
      await prisma.notification.createMany({
        data: bphUsers.map(bph => ({
          userId: bph.id,
          title: 'Pendaftar Baru',
          message: `${name} telah mendaftar dan menunggu persetujuan Anda.`,
          link: '/admin/users'
        }))
      })
    }

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } })
  } catch (error) {
    return serverError(error)
  }
}
