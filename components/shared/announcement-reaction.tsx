'use client'

import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AnnouncementReaction({
  announcementId,
  initialCount = 0,
  initialReacted = false,
}: {
  announcementId: string
  initialCount?: number
  initialReacted?: boolean
}) {
  const [count, setCount] = useState(initialCount)
  const [reacted, setReacted] = useState(initialReacted)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/announcements/${announcementId}/react`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setReacted(data.reacted)
        setCount(data.count)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={reacted ? 'Batalkan reaksi' : 'Beri reaksi'}
      aria-pressed={reacted}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        reacted
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
      )}
    >
      <ThumbsUp className="h-3.5 w-3.5" />
      {count > 0 ? `${count} reaksi` : 'Reaksi'}
    </button>
  )
}
