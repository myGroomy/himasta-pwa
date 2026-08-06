import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, BookOpen, FlaskConical, GraduationCap, LayoutGrid, LogIn,
  Megaphone, MonitorSmartphone, ShieldCheck, Sparkles, Target,
} from 'lucide-react'
import { getOptionalSession } from '@/lib/permissions'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export const metadata = {
  title: 'Tentang Kami | HIMASTA',
  description: 'Kenali HIMASTA, himpunan mahasiswa Sains Data ULBI, dan fungsi setiap divisinya.',
}

export const dynamic = 'force-dynamic'

const divisions = [
  {
    abbr: 'BPH',
    name: 'Badan Pengurus Harian',
    icon: ShieldCheck,
    desc: 'Penggerak utama organisasi yang mengoordinasikan seluruh divisi. Memastikan setiap program kerja berjalan selaras dengan arah HIMASTA.',
    focus: ['Koordinasi Divisi', 'Pengambilan Keputusan', 'Arah Organisasi'],
  },
  {
    abbr: 'PSDM',
    name: 'Pengembangan Sumber Daya Manusia',
    icon: GraduationCap,
    desc: 'Mengembangkan potensi anggota melalui pelatihan, kaderisasi, dan pendampingan agar setiap anggota siap berkontribusi.',
    focus: ['Pelatihan', 'Kaderisasi', 'Pendampingan'],
  },
  {
    abbr: 'RION',
    name: 'Riset & Inovasi',
    icon: FlaskConical,
    desc: 'Menumbuhkan budaya riset dan inovasi keilmuan. Menjadi ruang bagi anggota untuk meneliti, berkarya, dan berkompetisi.',
    focus: ['Riset', 'Inovasi', 'Kompetisi Ilmiah'],
  },
  {
    abbr: 'PR',
    name: 'Public Relations',
    icon: Megaphone,
    desc: 'Membangun citra dan relasi HIMASTA bersama kampus, alumni, industri, serta masyarakat luas.',
    focus: ['Branding', 'Kerja Sama', 'Relasi Publik'],
  },
  {
    abbr: 'KOMINFO',
    name: 'Komunikasi & Informasi',
    icon: MonitorSmartphone,
    desc: 'Mengelola komunikasi internal, publikasi digital, media sosial, hingga infrastruktur sistem informasi HIMASTA.',
    focus: ['Media Sosial', 'Publikasi', 'Sistem Informasi'],
  },
  {
    abbr: 'AKADEMIK',
    name: 'Divisi Akademik & Keilmuan',
    icon: BookOpen,
    desc: 'Mendampingi perjalanan akademik anggota lewat seminar keilmuan, mentoring belajar, dan fasilitasi prestasi akademik.',
    focus: ['Seminar Keilmuan', 'Mentoring', 'Prestasi Akademik'],
  },
]

const misi = [
  'Membangun budaya belajar dan kolaborasi antar anggota.',
  'Mendorong riset dan inovasi yang berdampak nyata.',
  'Menyelenggarakan kegiatan akademik dan non-akademik yang bermanfaat.',
  'Mengelola organisasi secara transparan dan profesional.',
]

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${className}`}>{children}</span>
  )
}

export default async function TentangPage() {
  const user = await getOptionalSession()

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-md">
              <Image src="/himasta-logo.png" alt="Logo HIMASTA" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight">HIMASTA</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/welcome"
              className="hidden text-sm font-semibold transition-colors hover:text-primary/70 md:block"
            >
              Beranda
            </Link>
            <ThemeToggle />
            {user ? (
              <Link
                href="/"
                className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-semibold transition-colors hover:text-primary/70 sm:block"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-all hover:opacity-90"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* Hero */}
        <section className="px-5 pb-12 pt-28 sm:px-8 md:pt-32 lg:px-12">
          <div className="relative mx-auto flex min-h-[420px] max-w-[1200px] items-center justify-center overflow-hidden rounded-[20px] bg-[#0b0d12] px-6 py-20">
            <div className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[#2563eb]/40 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-28 -right-12 h-80 w-80 rounded-full bg-[#7c3aed]/25 blur-[130px]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right,#fff 1px,transparent 1px), linear-gradient(to bottom,#fff 1px,transparent 1px)',
                backgroundSize: '44px 44px',
                maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
              }}
            />
            <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
              <Label className="mb-6 text-white/50">Tentang Kami</Label>
              <h1 className="text-4xl font-light leading-[1.1] tracking-tight text-white md:text-6xl">
                Satu himpunan,
                <br />
                <span className="italic">enam penggerak.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-white/60 md:text-lg">
                Kenali HIMASTA dan enam divisi yang bekerja sama menjaga organisasi tetap berjalan, tumbuh, dan
                berdampak.
              </p>
            </div>
          </div>
        </section>

        {/* Apa itu HIMASTA */}
        <section className="px-5 pb-24 pt-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="rounded-[20px] border border-border bg-muted/30 p-8 md:p-12">
              <Label className="text-muted-foreground">Apa itu HIMASTA</Label>
              <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
                <p className="text-[26px] font-light leading-tight tracking-tight text-foreground md:text-[34px] lg:col-span-3">
                  HIMASTA adalah Himpunan Mahasiswa Sains Data ULBI, wadah resmi mahasiswa program studi Sains
                  Data untuk berorganisasi, belajar, dan berkarya.
                </p>
                <div className="flex flex-col justify-between gap-8 lg:col-span-2">
                  <p className="text-[15px] font-light leading-relaxed text-muted-foreground">
                    HIMASTA menyatukan seluruh aktivitas organisasi, mulai dari pengumuman, absensi kegiatan,
                    arsip dokumen, hingga tata kelola program kerja, dalam satu ekosistem digital yang ringkas,
                    transparan, dan mudah diakses oleh seluruh anggota.
                  </p>
                  <div className="space-y-2">
                    <RevealItem active title="Berkolaborasi" desc="Anggota, divisi, dan pengurus saling terhubung dalam satu ruang digital." />
                    <RevealItem title="Berkembang bersama" desc="Riset, pelatihan, dan kegiatan akademik didorong untuk tumbuh bersama." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="px-5 pb-24 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-16 flex max-w-[1200px] flex-col items-center text-center">
              <Label className="text-muted-foreground">Visi & Misi</Label>
              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight md:text-[42px]">
                Arah yang kami tuju.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-[20px] border border-border bg-muted/30 p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-light tracking-tight">Visi</h3>
                </div>
                <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">
                  Menjadi himpunan yang unggul dalam pengembangan sumber daya manusia dan inovasi keilmuan di
                  bidang sains data.
                </p>
              </div>
              <div className="rounded-[20px] border border-border bg-muted/30 p-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Target className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-light tracking-tight">Misi</h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {misi.map((m) => (
                    <li key={m} className="flex items-start gap-3 text-[15px] font-light leading-relaxed text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Divisi */}
        <section className="px-5 pb-24 pt-8 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="mx-auto mb-16 flex max-w-[1200px] flex-col items-center text-center">
              <Label className="text-muted-foreground">Divisi Kami</Label>
              <h2 className="mt-4 text-4xl font-light leading-tight tracking-tight md:text-[42px]">
                Enam divisi, satu tujuan.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {divisions.map((d) => (
                <div
                  key={d.abbr}
                  className="flex flex-col rounded-[20px] border border-border bg-muted/30 p-8 transition-all duration-300 hover:-translate-y-1 hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <d.icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {d.abbr}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-light tracking-tight">{d.name}</h3>
                  <p className="mt-3 text-[15px] font-light leading-relaxed text-muted-foreground">{d.desc}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {d.focus.map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-light text-muted-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[20px] bg-[#0b0d12] px-6 md:h-[360px]">
              <div className="pointer-events-none absolute -left-16 -top-24 h-72 w-72 rounded-full bg-[#2563eb]/40 blur-[120px]" />
              <div className="pointer-events-none absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-[#7c3aed]/25 blur-[130px]" />
              <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center">
                <h2 className="text-4xl font-light leading-tight tracking-tight text-white md:text-5xl">
                  Tertarik bergabung?
                </h2>
                <p className="mt-6 max-w-md text-base font-light leading-relaxed text-white/60">
                  Daftarkan akunmu dan mulai berkolaborasi bersama HIMASTA.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center gap-2 rounded-[100px] bg-white px-7 text-sm font-medium tracking-wide text-black transition-all duration-300 hover:bg-white/90"
                  >
                    Daftar Akun
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/welcome"
                    className="inline-flex h-11 items-center gap-2 rounded-[100px] border border-white/20 px-7 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-white/10"
                  >
                    Kembali ke Beranda
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function RevealItem({ title, desc, active = false }: { title: string; desc: string; active?: boolean }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden border-t border-border pb-4 pt-6">
        <div
          className={`absolute left-0 top-0 h-[2px] bg-primary transition-all duration-500 ${
            active ? 'w-1/3' : 'w-0 group-hover:w-full'
          }`}
        />
        <h4 className="mb-2 text-base font-medium tracking-tight text-foreground">{title}</h4>
        <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
          <p className="overflow-hidden pr-4 text-sm font-light leading-relaxed text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  )
}
