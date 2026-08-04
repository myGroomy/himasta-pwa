import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'BPH') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { users } = await req.json()

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Data tidak valid atau kosong' }, { status: 400 })
    }

    const defaultPassword = await hash('himasta123', 10)
    
    // Ambil semua divisi untuk pemetaan
    const divisions = await prisma.division.findMany()

    let successCount = 0
    let failedCount = 0

    for (const row of users) {
      if (!row.Email || !row.Nama) {
        failedCount++
        continue
      }

      // Pemetaan Role (default ANGGOTA)
      const allowedRoles = ['ANGGOTA', 'KADIV', 'BPH', 'DOSEN']
      const role = allowedRoles.includes(row.Peran?.toUpperCase()) ? row.Peran.toUpperCase() : 'ANGGOTA'

      // Pemetaan Status
      const isActive = String(row['Status Aktif']).toLowerCase() !== 'nonaktif'

      // Pemetaan Divisi (Cari berdasarkan nama string mirip)
      let divisionId = null
      if (row.Divisi && row.Divisi !== 'UMUM/BPH') {
        const div = divisions.find(d => d.name.toLowerCase().includes(row.Divisi.toLowerCase()))
        if (div) divisionId = div.id
      }

      try {
        await prisma.user.upsert({
          where: { email: row.Email },
          update: {
            name: row.Nama,
            nim: row.NIM || null,
            phone: row['No. HP'] || null,
            role: role as any,
            divisionId: divisionId,
            isActive: isActive,
          },
          create: {
            email: row.Email,
            name: row.Nama,
            nim: row.NIM || null,
            phone: row['No. HP'] || null,
            password: defaultPassword,
            role: role as any,
            divisionId: divisionId,
            isActive: isActive,
          }
        })
        successCount++
      } catch (e) {
        console.error('Failed to import user:', row.Email, e)
        failedCount++
      }
    }

    return NextResponse.json({ 
      message: `Berhasil import ${successCount} anggota, gagal ${failedCount}`,
      successCount,
      failedCount 
    })
  } catch (error: any) {
    console.error('Import CSV error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
