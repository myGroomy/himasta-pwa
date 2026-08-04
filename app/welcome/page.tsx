import Link from 'next/link'
import Image from 'next/image'
import {
  LogIn, Sparkles, UserPlus, Target, Users,
  FolderOpen, QrCode, ArrowRight, LayoutGrid, CheckCircle2, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getOptionalSession } from '@/lib/permissions'
import { EventLandingCard } from '@/components/events/event-landing-card'

import { ThemeToggle } from '@/components/shared/theme-toggle'

export const metadata = {
  title: 'HIMASTA | Himpunan Mahasiswa Sains Data',
  description: 'Ekosistem Digital Himpunan Mahasiswa Sains Data ULBI',
}

export const dynamic = 'force-dynamic'

export default async function WelcomePage() {
  const user = await getOptionalSession()

  const [totalUsers, activeProkers, totalDivisions, publishedEvents, myRegistrations] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.proker.count({ where: { status: 'BERJALAN' } }),
    prisma.division.count(),
    prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      include: { _count: { select: { registrations: true } } },
      orderBy: { startTime: 'asc' },
      take: 3,
    }),
    user
      ? prisma.eventRegistration.findMany({
          where: { userId: user.id },
          select: { eventId: true, qrToken: true },
        })
      : Promise.resolve([]),
  ])

  const myRegistrationByEvent = new Map(
    myRegistrations.map((r) => [r.eventId, r.qrToken ?? null])
  )

  const benefits = [
    { 
      icon: QrCode, 
      title: 'Absensi Tanpa Ribet', 
      desc: 'Hadir rapat dan event cukup dengan satu kali scan kode QR dari HP Anda. Tidak ada lagi absen kertas.' 
    },
    { 
      icon: FolderOpen, 
      title: 'Pusat Pengetahuan & Arsip', 
      desc: 'Akses cepat ke materi akademik, proposal, LPJ, dan dokumen penting himpunan kapan saja.' 
    },
    { 
      icon: CheckCircle2, 
      title: 'Bebas Birokrasi Kertas', 
      desc: 'Pengajuan izin tidak hadir dan persetujuan proker dilakukan 100% secara digital dan transparan.' 
    },
    { 
      icon: Target, 
      title: 'Pantau Kinerja Bersama', 
      desc: 'Lihat langsung progress program kerja, pembagian tugas, dan pencapaian divisi Anda secara real-time.' 
    },
  ]

  const divisions = [
    { id: '01', name: 'BPH', desc: 'Pengarah Kebijakan & Koordinasi Utuh Organisasi', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
    { id: '02', name: 'PSDM', desc: 'Kaderisasi & Keakraban Anggota', color: 'bg-green-500/10 text-green-600 border-green-200' },
    { id: '03', name: 'RION', desc: 'Pengembangan Keilmuan Sains Data & Data Analysis', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200' },
    { id: '04', name: 'PR', desc: 'Hubungan Eksternal & Pengabdian Masyarakat', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
    { id: '05', name: 'KOMINFO', desc: 'Media Kreatif, Publikasi, & Infrastruktur Digital', color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
    { id: '06', name: 'AKADEMIK', desc: 'Inovasi Pembelajaran & Kajian Ilmu Sains Data', color: 'bg-teal-500/10 text-teal-600 border-teal-200' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Header Bar */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border transition-all">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-md">
              <Image src="/himasta-logo.png" alt="Logo HIMASTA" fill className="object-contain" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">HIMASTA</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm" className="rounded-full px-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Link href="/">
                  <LayoutGrid className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold hover:text-primary/80 transition-colors hidden sm:block">
                  Masuk
                </Link>
                <Button asChild size="sm" className="rounded-full px-5 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <Link href="/register">
                    Daftar Akun
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden border-b border-border">
        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-pastel-blue/30 rounded-full blur-[120px]" />
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #8882 1px, transparent 1px), linear-gradient(to bottom, #8882 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
            }}
          />
        </div>

        <div className="container max-w-4xl mx-auto text-center relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">


          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Satu Platform.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/50">
              Ekosistem Digital HIMASTA.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Akses informasi akademik, kalender event, hingga administrasi organisasi secara terpadu. Mari berkembang dan berkontribusi bersama.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <Link href="/">
                    <LayoutGrid className="mr-2 h-5 w-5" />
                    Buka Dashboard
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base bg-background/50 backdrop-blur-sm hover:bg-secondary transition-all">
                  <Link href="/events">
                    Lihat Event
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 text-base shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <Link href="/register">
                    Mulai Berkontribusi
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base bg-background/50 backdrop-blur-sm hover:bg-secondary transition-all">
                  <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Masuk ke Portal
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats Section */}
      <section className="py-12 bg-background border-b border-border relative z-20 -mt-10">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-background/80 backdrop-blur-xl border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight">{totalUsers}</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">Anggota Aktif</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/80 backdrop-blur-xl border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-4 bg-pastel-blue/20 text-pastel-blue-foreground rounded-2xl">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight">{totalDivisions}</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">Divisi Bergerak</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/80 backdrop-blur-xl border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="p-4 bg-pastel-green/20 text-pastel-green-foreground rounded-2xl">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight">{activeProkers}</div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">Proker Berjalan</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Benefits Section */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="container max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Lebih dari Sekadar Sistem.</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              HimastaApp hadir untuk memudahkan hidup Anda sebagai mahasiswa ULBI, menghilangkan birokrasi rumit, dan mempercepat kolaborasi.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="group relative p-8 rounded-3xl bg-background border border-border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{b.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      {publishedEvents.length > 0 && (
        <section id="events" className="py-24 px-4 bg-background border-t border-border">
          <div className="container max-w-6xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Event & Kegiatan Terbaru</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Ikuti berbagai kegiatan seru dan bermanfaat yang diselenggarakan oleh HIMASTA, terbuka untuk anggota dan umum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedEvents.map((event) => (
                <EventLandingCard
                  key={event.id}
                  event={{
                    id: event.id,
                    name: event.name,
                    startTime: event.startTime.toISOString(),
                    location: event.location,
                    visibility: event.visibility,
                    capacity: event.capacity,
                    _count: { registrations: event._count.registrations },
                  }}
                  user={
                    user
                      ? { id: user.id, role: user.role }
                      : null
                  }
                  registered={myRegistrationByEvent.has(event.id)}
                  qrToken={myRegistrationByEvent.get(event.id) ?? null}
                />
              ))}
            </div>
            
            <div className="text-center pt-8">
              <Button asChild variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                <Link href={user ? '/events' : '/login'}>
                  Lihat Semua Event <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Bento Grid Divisions Section */}
      <section className="py-24 px-4 bg-background border-y border-border">
        <div className="container max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ruang Berkembang Anda</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Enam divisi utama yang menjadi tulang punggung pergerakan HIMASTA. Temukan passion Anda dan berkontribusi nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divisions.map((d) => (
              <div key={d.name} className="group relative overflow-hidden rounded-3xl border border-border bg-background p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 ${d.color.split(' ')[0]}`} />
                <div className="relative z-10">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border mb-4 ${d.color}`}>
                    Divisi {d.id}
                  </div>
                  <h3 className="text-2xl font-extrabold mb-2 group-hover:text-primary transition-colors">{d.name}</h3>
                  <p className="text-muted-foreground font-medium">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
        <div className="container max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Siap Menjadi Bagian dari Pergerakan?</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Bergabunglah sekarang, akses materi belajar, ikuti event seru, dan ukir prestasi bersama keluarga besar HIMASTA.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
                <Link href="/">
                  <LayoutGrid className="mr-2 h-5 w-5" />
                  Buka Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
                  <Link href="/register">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Daftar Sekarang
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg font-bold bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground transition-colors">
                  <Link href="/login">
                    Sudah punya akun?
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm font-medium text-muted-foreground bg-background">
        <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
            <Image src="/himasta-logo.png" alt="Himasta" width={24} height={24} className="object-contain" />
            <span className="font-bold text-foreground">HIMASTA App © 2026</span>
          </div>
          <p>Dibuat untuk Mahasiswa Sains Data ULBI</p>
        </div>
      </footer>
    </div>
  )
}
