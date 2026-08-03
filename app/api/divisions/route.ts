import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiSession } from '@/lib/api'

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { users: true, documents: true } } },
  })
  return NextResponse.json({ divisions })
}
