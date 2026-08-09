import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { serverError, rateLimited } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    // Endpoint publik + bcrypt hash mahal — batasi spam / brute force.
    const limited = rateLimited(req, { limit: 10 })
    if (limited) return limited

    const json = await req.json()
    const { name, email, nim, password, divisionId } = json

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nama, Email, dan Password wajib diisi' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
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
        email: normalizedEmail,
        nim: nim || null,
        password: hashedPassword,
        role: 'ANGGOTA',
        divisionId: divisionId || null,
        isActive: false, // Belum disetujui BPH
        pendingApproval: true, // Menunggu persetujuan BPH
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
