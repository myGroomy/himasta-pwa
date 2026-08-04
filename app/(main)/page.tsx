import Link from 'next/link'
import { QrCode, Plus, Target, FileClock, PartyPopper, CalendarDays, FolderOpen, CalendarClock } from 'lucide-react'
import { getOptionalSession } from '@/lib/permissions'
import { getPublishedAnnouncements } from '@/lib/feed'
import { AnnouncementCard } from '@/components/shared/announcement-card'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS } from '@/lib/constants'
import WelcomePage from '@/app/welcome/page'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getOptionalSession()

  if (!user) {
    return <WelcomePage />
  }

  const announcements = await getPublishedAnnouncements(user)

  return (
    <div className="space-y-10">
      {/* Hero Section with Grid Pattern Background */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-background text-foreground sm:p-10 p-6">
        {/* CSS Grid Background replicating the user's image */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #8882 1px, transparent 1px),
              linear-gradient(to bottom, #8882 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: 'center center',
            maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)',
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2 hidden">
            ✨ HIMASTA Hub V3
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight">
            Selamat datang, {user.name.split(' ')[0]}
          </h1>
          <p className="text-lg text-muted-foreground">
            {ROLE_LABELS[user.role]}
            {user.divisionId ? ' · Workspace Divisi Anda' : ' · Anggota HIMASTA'}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full shadow-lg">
              <Link href="/kegiatan/scan">
                <QrCode className="h-5 w-5 mr-2" />
                Scan Kegiatan
              </Link>
            </Button>
            {(user.role === 'KADIV' || user.role === 'BPH') && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full bg-background/50 backdrop-blur-sm"
              >
                <Link href="/announcements/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Buat Pengumuman
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>



      {/* Announcements */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Pengumuman Terbaru</h2>
            <p className="text-sm text-muted-foreground">Kabar resmi dari kepengurusan</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/announcements">Lihat semua →</Link>
          </Button>
        </div>

        {announcements.length === 0 ? (
          <EmptyState
            title="Belum ada pengumuman"
            description="Pengumuman resmi dari HIMASTA akan tampil di sini."
            className="rounded-2xl"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {announcements.slice(0, 4).map((a) => (
              <AnnouncementCard key={a.id} announcement={a} />
            ))}
          </div>
        )}
      </section>

      {/* Menu / Quick Actions Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">Menu Utama</h2>
        <div className="grid grid-cols-3 gap-4">
          <Card className="transition-all duration-200 border-border shadow-none hover:shadow-sm hover:scale-[1.02] cursor-pointer group bg-background">
            <Link href="/kegiatan" className="block">
              <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-pastel-blue text-pastel-blue-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Kegiatan</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="transition-all duration-200 border-border shadow-none hover:shadow-sm hover:scale-[1.02] cursor-pointer group bg-background">
            <Link href="/dokumen" className="block">
              <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-pastel-green text-pastel-green-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Dokumen</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="transition-all duration-200 border-border shadow-none hover:shadow-sm hover:scale-[1.02] cursor-pointer group bg-background">
            <Link href="/proker" className="block">
              <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-pastel-red text-pastel-red-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                  <Target className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Proker</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="transition-all duration-200 border-border shadow-none hover:shadow-sm hover:scale-[1.02] cursor-pointer group bg-background">
            <Link href="/izin" className="block">
              <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-pastel-blue text-pastel-blue-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                  <FileClock className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Perizinan</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="transition-all duration-200 border-border shadow-none hover:shadow-sm hover:scale-[1.02] cursor-pointer group bg-background">
            <Link href={user.role === 'BPH' || user.role === 'KADIV' ? '/events' : '/welcome'} className="block">
              <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-pastel-yellow text-pastel-yellow-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                  <PartyPopper className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Event</p>
              </CardContent>
            </Link>
          </Card>
          <Card className="transition-all duration-200 border-border shadow-none hover:shadow-sm hover:scale-[1.02] cursor-pointer group bg-background">
            <Link href="/kalender" className="block">
              <CardContent className="flex flex-col items-center gap-3 pt-6 pb-5 text-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors dark:group-hover:bg-border">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <p className="font-semibold text-foreground">Kalender</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}
