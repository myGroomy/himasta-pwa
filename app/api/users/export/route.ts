import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'BPH') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        division: true,
      },
      orderBy: { name: 'asc' },
    })

    // Header CSV
    const headers = ['NIM', 'Nama', 'Email', 'No. HP', 'Peran', 'Divisi', 'Status Aktif']
    
    // Baris CSV
    const rows = users.map(u => [
      u.nim || '',
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.phone || '',
      u.role,
      u.division?.name || 'UMUM/BPH',
      u.pendingApproval ? 'Pending' : u.isActive ? 'Aktif' : 'Nonaktif'
    ])

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="Data_Anggota_HIMASTA.csv"',
      }
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
