import { NextResponse } from 'next/server'
import { getOptionalSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const user = await getOptionalSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone, photoUrl } = await req.json()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        phone: typeof phone === 'string' ? phone : undefined,
        image: typeof photoUrl === 'string' ? photoUrl : undefined,
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
