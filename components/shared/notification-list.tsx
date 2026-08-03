'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { cn, timeAgo } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export type NotificationItem = {
  id: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationList({ initial }: { initial: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(initial)

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {})
  }

  async function markAllRead() {
    await Promise.all(
      notifications
        .filter((n) => !n.isRead)
        .map((n) => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' }))
    )
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    toast({ title: 'Semua notifikasi ditandai sudah dibaca' })
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{unreadCount} belum dibaca</p>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Notifikasi pengumuman baru dan aktivitas Anda akan muncul di sini."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const inner = (
              <div
                className={cn(
                  'flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors',
                  !n.isRead && 'border-primary/30 bg-primary/5'
                )}
              >
                <div className="mt-0.5">
                  {n.isRead ? (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <span className="block h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            )
            return n.link ? (
              <Link key={n.id} href={n.link} onClick={() => markRead(n.id)} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
