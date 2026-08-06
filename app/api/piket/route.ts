import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/permissions'

export async function GET() {
  try {
    const user = await requireSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pikets = await prisma.piket.findMany({
      include: {
        user: {
          select: { id: true, name: true, nim: true, role: true, division: { select: { name: true } } }
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ pikets })
  } catch (error) {
    console.error('Error fetching piket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession()
    if (!user || user.role !== 'BPH') {
      return NextResponse.json({ error: 'Only BPH can assign picket schedules' }, { status: 403 })
    }

    const { userId, date } = await request.json()
    if (!userId || !date) {
      return NextResponse.json({ error: 'Missing userId or date' }, { status: 400 })
    }

    const parsedDate = new Date(date)
    parsedDate.setHours(0, 0, 0, 0) // Start of day

    // Check if schedule already exists
    const existing = await prisma.piket.findUnique({
      where: {
        date_userId: {
          date: parsedDate,
          userId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Jadwal piket untuk anggota ini pada tanggal tersebut sudah ada.' }, { status: 400 })
    }

    const piket = await prisma.piket.create({
      data: {
        userId,
        date: parsedDate,
        status: 'BELUM'
      },
      include: {
        user: {
          select: { id: true, name: true, nim: true }
        }
      }
    })

    return NextResponse.json({ piket })
  } catch (error) {
    console.error('Error creating piket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
