'use client'

import sanitizeHtml from 'sanitize-html'
import { Calendar, Globe, Lock, UserRound } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDateTime } from '@/lib/utils'

export type AnnouncementDialogData = {
  id: string
  title: string
  content: string
  category?: string | null
  scope: string
  visibleToDosen?: boolean
  publishedAt?: Date | string | null
  createdAt?: Date | string
  author: { name: string }
  division?: { name: string } | null
}

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

export function AnnouncementDialog({
  announcement,
  open,
  onOpenChange,
}: {
  announcement: AnnouncementDialogData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!announcement) return null

  const category = announcement.category ?? ''
  const initials = announcement.author.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  const date = announcement.publishedAt ?? announcement.createdAt

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {announcement.scope === 'GENERAL' ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Globe className="h-3 w-3" /> General
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Lock className="h-3 w-3" /> {announcement.division?.name ?? 'Divisi'}
              </span>
            )}
            {CATEGORY_LABEL[category] && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                  CATEGORY_BADGE[category] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {CATEGORY_LABEL[category]}
              </span>
            )}
            {announcement.visibleToDosen && (
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Dosen
              </span>
            )}
          </div>
          <DialogTitle className="text-2xl leading-snug text-left">
            {announcement.title}
          </DialogTitle>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5" />
                {announcement.author.name}
              </span>
            </span>
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateTime(date)}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="border-t border-border pt-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm leading-7"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(announcement.content, {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ['src', 'alt', 'class'],
                  '*': ['class'],
                },
              }),
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
