'use client'

import { useState } from 'react'
import sanitizeHtml from 'sanitize-html'
import { Globe, Lock } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'
import {
  AnnouncementDialog,
  type AnnouncementDialogData,
} from '@/components/shared/announcement-dialog'
import { AnnouncementReaction } from '@/components/shared/announcement-reaction'

const CATEGORY_BADGE: Record<string, string> = {
  event: 'bg-amber-100 text-amber-900',
  beasiswa: 'bg-emerald-100 text-emerald-900',
  akademik: 'bg-sky-100 text-sky-900',
  organisasi: 'bg-cyan-100 text-cyan-900',
}

const CATEGORY_LABEL: Record<string, string> = {
  event: 'Event',
  beasiswa: 'Beasiswa',
  akademik: 'Akademik',
  organisasi: 'Organisasi',
}

export function AnnouncementList({
  announcements,
  currentUserId,
}: {
  announcements: AnnouncementDialogData[]
  currentUserId?: string
}) {
  const [selected, setSelected] = useState<AnnouncementDialogData | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {announcements.map((a) => {
        const category = a.category ?? ''
        const initials = a.author.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((n) => n[0]?.toUpperCase() ?? '')
          .join('')
        const date = a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt ?? Date.now())

        return (
          <article
            key={a.id}
            onClick={() => setSelected(a)}
            className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {a.scope === 'GENERAL' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {a.scope === 'GENERAL' ? 'General' : (a.division?.name ?? 'Divisi')}
                </span>
                {CATEGORY_LABEL[category] && (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                      CATEGORY_BADGE[category] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {CATEGORY_LABEL[category]}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                {timeAgo(date)}
              </span>
            </div>

            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-foreground">
              {a.title}
            </h3>
            <p
              className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(a.content, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li']),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    '*': ['class'],
                  },
                }),
              }}
            />

            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold text-foreground">{a.author.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {a.scope === 'GENERAL' ? 'HIMASTA' : (a.division?.name ?? 'Divisi')}
                </p>
              </div>
              <div className="ml-auto">
                <AnnouncementReaction
                  announcementId={a.id}
                  initialCount={a._count?.reactions ?? 0}
                  initialReacted={a.reactions?.some((r) => r.userId === currentUserId) ?? false}
                />
              </div>
            </div>
          </article>
        )
      })}

      <AnnouncementDialog
        announcement={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
