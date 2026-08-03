import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, UserRound } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { getAnnouncementById } from '@/lib/feed'
import { scopeBadge } from '@/components/shared/announcement-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AnnouncementDetailPage({ params }: { params: { id: string } }) {
  const user = await requireSession()
  const announcement = await getAnnouncementById(params.id, user)

  if (!announcement) notFound()

  const categoryLabel: Record<string, string> = {
    event: 'Event',
    beasiswa: 'Beasiswa',
    akademik: 'Akademik',
    organisasi: 'Organisasi',
  }

  const initials = announcement.author.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/announcements">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {scopeBadge(announcement.scope, announcement.division?.name)}
            <span className="rounded-md border px-2 py-0.5 text-xs font-medium">{categoryLabel[announcement.category] ?? announcement.category}</span>
            {announcement.visibleToDosen && (
              <span className="rounded-md border px-2 py-0.5 text-xs font-medium">Dosen</span>
            )}
          </div>
          <CardTitle className="text-2xl leading-snug">{announcement.title}</CardTitle>
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
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(announcement.publishedAt ?? announcement.createdAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="whitespace-pre-line text-sm leading-7">{announcement.content}</CardContent>
      </Card>
    </div>
  )
}
