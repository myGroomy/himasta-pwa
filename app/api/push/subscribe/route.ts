import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await requireSession()
    const { endpoint, keys } = await req.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Subscription tidak lengkap' }, { status: 400 })
    }

    // Upsert: satu endpoint = satu baris, ganti kunci kalau berubah.
    const sub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userId: user.id },
      create: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    return NextResponse.json({ ok: true, id: sub.id })
  } catch (err: any) {
    if (err?.message?.includes('NEXT_REDIRECT')) throw err
    return NextResponse.json({ error: 'Gagal simpan subscription' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireSession()
    const { endpoint } = await req.json().catch(() => ({}))

    if (endpoint) {
      await prisma.pushSubscription.deleteMany({ where: { userId: user.id, endpoint } })
    } else {
      await prisma.pushSubscription.deleteMany({ where: { userId: user.id } })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.message?.includes('NEXT_REDIRECT')) throw err
    return NextResponse.json({ error: 'Gagal hapus subscription' }, { status: 500 })
  }
}
