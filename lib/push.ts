import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@himasta.org'

export const vapidConfigured = Boolean(publicKey && privateKey)

if (vapidConfigured) {
  webpush.setVapidDetails(subject, publicKey!, privateKey!)
}

type PushPayload = { title: string; message: string; link?: string }
// Kirim push ke semua subscription milik user. Subscription yang mati (410/404)
// dibersihkan dari DB agar tidak menumpuk.
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  if (!vapidConfigured || userIds.length === 0) return

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
    select: { id: true, endpoint: true, p256dh: true, auth: true },
  })
  if (subs.length === 0) return

  const body = JSON.stringify({
    title: payload.title,
    body: payload.message,
    url: payload.link || '/notifikasi',
  })
  const dead: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body
        )
      } catch (err: any) {
        // 404/410 = subscription hilang/dicabut → hapus
        if (err?.statusCode === 404 || err?.statusCode === 410) dead.push(sub.id)
      }
    })
  )

  if (dead.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } })
  }
}

// Fire-and-forget: jangan blok response API kalau push gagal.
export function pushToUsersAsync(userIds: string[], payload: PushPayload) {
  sendPushToUsers(userIds, payload).catch(() => {})
}
