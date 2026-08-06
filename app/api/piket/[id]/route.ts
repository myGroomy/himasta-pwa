import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/permissions'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const piket = await prisma.piket.findUnique({
      where: { id: params.id },
    })

    if (!piket) {
      return NextResponse.json({ error: 'Piket schedule not found' }, { status: 404 })
    }

    // Only BPH or the assigned user can update
    const isBPH = user.role === 'BPH'
    const isAssignedUser = piket.userId === user.id

    if (!isBPH && !isAssignedUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { beforePhoto, afterPhoto, status } = body

    const updateData: any = {}

    if (beforePhoto !== undefined) {
      updateData.beforePhoto = beforePhoto
    }
    if (afterPhoto !== undefined) {
      updateData.afterPhoto = afterPhoto
    }
    if (status !== undefined) {
      updateData.status = status
    }

    // Automatically set status to HADIR if both before and after photos exist
    const finalBefore = beforePhoto !== undefined ? beforePhoto : piket.beforePhoto
    const finalAfter = afterPhoto !== undefined ? afterPhoto : piket.afterPhoto

    if (finalBefore && finalAfter && piket.status !== 'HADIR') {
      updateData.status = 'HADIR'
      updateData.checkedInAt = new Date()
    }

    const updated = await prisma.piket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, nim: true }
        }
      }
    })

    return NextResponse.json({ piket: updated })
  } catch (error) {
    console.error('Error updating piket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireSession()
    if (!user || user.role !== 'BPH') {
      return NextResponse.json({ error: 'Only BPH can delete picket schedules' }, { status: 403 })
    }

    const piket = await prisma.piket.findUnique({
      where: { id: params.id },
    })

    if (!piket) {
      return NextResponse.json({ error: 'Piket schedule not found' }, { status: 404 })
    }

    await prisma.piket.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Piket schedule deleted' })
  } catch (error) {
    console.error('Error deleting piket:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
