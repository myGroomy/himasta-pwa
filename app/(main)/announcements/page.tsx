import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { getPublishedAnnouncements } from '@/lib/feed'
import { AnnouncementCard } from '@/components/shared/announcement-card'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { value: 'all', label: 'Semua' },
  { value: 'organisasi', label: 'Organisasi' },
  { value: 'event', label: 'Event' },
  { value: 'beasiswa', label: 'Beasiswa' },
  { value: 'akademik', label: 'Akademik' },
]

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const user = await requireSession()
  const category = searchParams.category && searchParams.category !== 'all' ? searchParams.category : undefined

  const announcements = await getPublishedAnnouncements(user, category ? { category } : {})

  const canCreate = user.role === 'KADIV' || user.role === 'BPH'

  return (
    <div>
      <PageHeader
        title="Pengumuman"
        description="Informasi resmi HIMASTA general & per divisi."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/announcements/new">
                <Plus className="h-4 w-4" />
                Buat Pengumuman
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Tabs defaultValue={category ?? 'all'} className="mb-6">
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value} asChild>
              <Link href={c.value === 'all' ? '/announcements' : `/announcements?category=${c.value}`}>
                {c.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {announcements.length === 0 ? (
        <EmptyState
          title="Tidak ada pengumuman"
          description="Belum ada pengumuman pada kategori ini."
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  )
}
