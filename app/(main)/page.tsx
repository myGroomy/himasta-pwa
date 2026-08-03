import Link from 'next/link'
import { ArrowRight, QrCode, Plus } from 'lucide-react'
import { requireSession } from '@/lib/permissions'
import { getPublishedAnnouncements } from '@/lib/feed'
import { AnnouncementCard } from '@/components/shared/announcement-card'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await requireSession()
  const announcements = await getPublishedAnnouncements(user)

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-primary to-indigo-700 p-6 text-white shadow-lg sm:p-8">
        <p className="text-sm font-medium text-white/80">Selamat datang kembali,</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{user.name}</h1>
        <p className="mt-1 text-sm text-white/80">
          {ROLE_LABELS[user.role]}
          {user.divisionId ? ' · ' : ''}
          {user.role === 'ANGGOTA' || user.role === 'KADIV' ? 'Workspace divisi Anda' : ''}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90">
            <Link href="/absensi/scan">
              <QrCode className="h-4 w-4" />
              Scan Absensi
            </Link>
          </Button>
          {(user.role === 'KADIV' || user.role === 'BPH') && (
            <Button
              asChild
              variant="secondary"
              className="bg-white/20 text-white hover:bg-white/30"
            >
              <Link href="/announcements/new">
                <Plus className="h-4 w-4" />
                Buat Pengumuman
              </Link>
            </Button>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <PageHeader title="Informasi Terbaru" className="mb-0" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/announcements">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            title="Belum ada pengumuman"
            description="Pengumuman resmi dari HIMASTA akan tampil di sini."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.slice(0, 6).map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Absensi QR</p>
              <p className="text-sm text-muted-foreground">Scan QR untuk mencatat kehadiran rapat Anda.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/absensi">Buka</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ArrowRight className="h-6 w-6 rotate-45" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Arsip Dokumen</p>
              <p className="text-sm text-muted-foreground">Akses notulen, proposal, dan LPJ divisi.</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/dokumen">Buka</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
