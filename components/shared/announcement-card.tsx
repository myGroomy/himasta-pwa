import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import type { Announcement, AnnouncementScope, AnnouncementStatus, User, Division } from '@prisma/client'
import { Calendar, Eye, Globe, Lock, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'

type AnnouncementCardData = Announcement & {
  author: Pick<User, 'name' | 'email'>
  division?: Pick<Division, 'name' | 'slug'> | null
}

const CATEGORY_BADGE: Record<string, string> = {
  event: 'bg-amber-100 text-amber-900 font-semibold',
  beasiswa: 'bg-emerald-100 text-emerald-900 font-semibold',
  akademik: 'bg-sky-100 text-sky-900 font-semibold',
  organisasi: 'bg-cyan-100 text-cyan-900 font-semibold',
}

const CATEGORY_LABEL: Record<string, string> = {
  event: 'Event',
  beasiswa: 'Beasiswa',
  akademik: 'Akademik',
  organisasi: 'Organisasi',
}

export function statusBadge(status: AnnouncementStatus) {
  switch (status) {
    case 'PUBLISHED':
      return <Badge variant="success">Tayang</Badge>
    case 'PENDING_APPROVAL':
      return <Badge variant="warning">Menunggu Approval</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">Ditolak</Badge>
    default:
      return <Badge variant="secondary">Draf</Badge>
  }
}

export function scopeBadge(scope: AnnouncementScope, divisionName?: string | null) {
  if (scope === 'GENERAL') {
    return (
      <Badge variant="outline" className="gap-1">
        <Globe className="h-3 w-3" /> General
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Lock className="h-3 w-3" /> {divisionName ?? 'Divisi'}
    </Badge>
  )
}

export function AnnouncementCard({
  announcement,
  showStatus = false,
  children,
}: {
  announcement: AnnouncementCardData
  showStatus?: boolean
  children?: React.ReactNode
}) {
  const category = (announcement as { category?: string }).category
  const initials = announcement.author.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {scopeBadge(announcement.scope, announcement.division?.name)}
            {category && CATEGORY_LABEL[category] && (
              <Badge className={CATEGORY_BADGE[category] ?? ''}>{CATEGORY_LABEL[category]}</Badge>
            )}
            {showStatus && statusBadge(announcement.status)}
            {announcement.visibleToDosen && (
              <Badge variant="outline" className="gap-1">
                <Eye className="h-3 w-3" /> Dosen
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg leading-snug">
          <Link href={`/announcements/${announcement.id}`} className="hover:underline">
            {announcement.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 overflow-hidden text-ellipsis [&>p]:inline [&>p]:mr-1">
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.content, { allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'] }) }} />
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 pt-0">
        {children}
      </CardContent>
      <CardFooter className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="flex items-center gap-1">
          <UserRound className="h-3 w-3" />
          {announcement.author.name}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {timeAgo(announcement.publishedAt ?? announcement.createdAt)}
        </span>
      </CardFooter>
    </Card>
  )
}
