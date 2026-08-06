'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight, CalendarDays, FolderOpen, LayoutGrid, LogIn, MapPin,
  QrCode, ShieldCheck, Target, Users, BookOpen, FlaskConical, Megaphone,
  MonitorSmartphone, Sparkles, Award, Quote, Trophy, Play, Mail, MapPinned,
  ChevronLeft, ChevronRight, Phone, Laptop, Lightbulb, Building
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Badge } from '@/components/ui/badge'

type EventData = {
  id: string
  name: string
  description: string | null
  startTime: string
  endTime: string | null
  location: string | null
  capacity: number | null
  visibility: 'INTERNAL' | 'PUBLIC'
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'
  division?: { name: string } | null
  _count?: { registrations: number }
}

type WelcomeViewProps = {
  user: any
  totalUsers: number
  activeProkers: number
  nextEvent: EventData | null
  eventDate: string[] | null
  eventTime: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

export function WelcomeView({ user, totalUsers, activeProkers, nextEvent, eventDate, eventTime }: WelcomeViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col transition-colors duration-300">
      {/* 1. TOP BAR */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-6 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPinned className="h-3.5 w-3.5 shrink-0" />
            Jl. Kolonel Masturi No.71, Cimahi
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            info@himasta.org
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest">Masa Bakti: 2026/2027</span>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center">
          <Link href="/welcome" className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <div className="relative h-8 w-8 overflow-hidden bg-white rounded p-0.5 shrink-0">
              <Image src="/himasta-logo.png" alt="Logo HIMASTA" fill className="object-contain" />
            </div>
            HIMASTA
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/welcome" className="text-primary border-b-2 border-primary pb-1">Beranda</Link>
          <a className="text-muted-foreground hover:text-primary transition" href="#divisi">Divisi</a>
          <a className="text-muted-foreground hover:text-primary transition" href="#benefits">Manfaat</a>
          <Link className="text-muted-foreground hover:text-primary transition" href="/welcome/events">Event Umum</Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Link 
              href="/" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90 transition flex items-center gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" /> Dashboard
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90 transition flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" /> Masuk Portal
            </Link>
          )}
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative bg-primary text-primary-foreground h-[600px] flex items-center justify-center text-center px-6 overflow-hidden">
        {/* Background Image */}
        <Image
          src="/wrking-together atoffice.jpg"
          alt="Hero Background"
          fill
          className="absolute inset-0 object-cover opacity-35 dark:opacity-20 mix-blend-overlay pointer-events-none"
          priority
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-4xl text-white space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Navigasi Masa Depan Lewat Kekuatan Data
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed font-light">
            Wadah kolaborasi mahasiswa Data Science untuk mengembangkan potensi teknis, kepemimpinan, dan dampak nyata bagi industri.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register" className="bg-white text-primary px-8 py-3 rounded font-bold hover:bg-slate-100 transition flex items-center justify-center gap-2">
              Bergabung Sekarang <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="bg-primary-foreground/10 border border-white/20 text-white px-8 py-3 rounded font-bold hover:bg-white/10 transition flex items-center justify-center gap-2">
              <Play className="h-4 w-4" /> Masuk Portal
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 4. DIVISIONS SECTION (PILAR UTAMA) */}
      <section id="divisi" className="py-20 bg-secondary transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-2"
          >
            <span className="text-primary font-semibold tracking-wider text-sm uppercase block">Program Kerja &amp; Divisi</span>
            <h2 className="text-4xl font-bold text-foreground">Pilar Utama Organisasi Kami</h2>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* BPH */}
            <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded text-center space-y-3 hover:shadow-md transition text-card-foreground">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-2">BPH (Badan Pengurus Harian)</h3>
              <p className="text-sm text-muted-foreground font-light">Manajemen Organisasi, Pengambil Kebijakan, Administrasi &amp; Keuangan</p>
            </motion.div>
            {/* PSDM */}
            <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded text-center space-y-3 hover:shadow-md transition text-card-foreground">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-2">PSDM (Pengembangan SDM)</h3>
              <p className="text-sm text-muted-foreground font-light">Kaderisasi Anggota, Pelatihan Soft Skills, Internal Bonding</p>
            </motion.div>
            {/* RION */}
            <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded text-center space-y-3 hover:shadow-md transition text-card-foreground">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <FlaskConical className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-2">RION (Riset &amp; Inovasi)</h3>
              <p className="text-sm text-muted-foreground font-light">Projek Data Riil, Kompetisi Akademik, Eksplorasi Keilmuan</p>
            </motion.div>
            {/* PR */}
            <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded text-center space-y-3 hover:shadow-md transition text-card-foreground">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <Megaphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-2">PR (Hubungan Masyarakat)</h3>
              <p className="text-sm text-muted-foreground font-light">Kemitraan Industri, Relasi Alumni, Branding Eksternal</p>
            </motion.div>
            {/* KOMINFO */}
            <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded text-center space-y-3 hover:shadow-md transition text-card-foreground">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-2">KOMINFO (Komunikasi &amp; Info)</h3>
              <p className="text-sm text-muted-foreground font-light">Publikasi Kreatif, Pengelolaan PWA, Sosial Media Branding</p>
            </motion.div>
            {/* AKADEMIK */}
            <motion.div variants={itemVariants} className="bg-card border border-border p-6 rounded text-center space-y-3 hover:shadow-md transition text-card-foreground">
              <div className="w-14 h-14 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground mb-2">AKADEMIK (Pendidikan)</h3>
              <p className="text-sm text-muted-foreground font-light">Mentoring Belajar, Modul &amp; Bank Soal, Asistensi Praktikum</p>
            </motion.div>
          </motion.div>

          <div className="text-center space-y-6 pt-10">
            <h3 className="text-3xl font-bold text-foreground">Program Kerja Unggulan</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {/* DS Boot Camp */}
              <div className="bg-card border border-border p-8 rounded hover:shadow-xl transition group text-card-foreground">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl mb-6 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <Laptop className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3">Data Science Boot Camp</h4>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  Pelatihan intensif bagi anggota untuk menguasai tools dan algoritma terkini dalam analisis data.
                </p>
              </div>
              {/* Industrial Visit */}
              <div className="bg-primary text-primary-foreground p-8 rounded shadow-xl md:-translate-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl mb-6">
                  <Building className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold mb-3">Industrial Visit 2026</h4>
                <p className="text-primary-foreground/80 mb-4 line-clamp-3">
                  Kunjungan langsung ke perusahaan teknologi terkemuka untuk memahami praktik industri nyata.
                </p>
              </div>
              {/* Hackathon */}
              <div className="bg-card border border-border p-8 rounded hover:shadow-xl transition group text-card-foreground">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl mb-6 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-3">HIMASTA Hackathon</h4>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  Kompetisi inovasi berbasis data untuk memecahkan masalah nyata di berbagai sektor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS & TESTIMONIALS SECTION (With Background Image) */}
      <section id="benefits" className="relative py-20 bg-background overflow-hidden border-b border-border">
        {/* Background Image for Benefits Section */}
        <Image
          src="/writting-plan-inglass.jpg"
          alt="Benefits Background"
          fill
          className="absolute inset-0 object-cover opacity-[0.04] dark:opacity-[0.02] pointer-events-none"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
          {/* Benefits */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="text-left space-y-2">
              <span className="text-primary font-semibold tracking-wider text-sm mb-2 uppercase">Mengapa Bergabung?</span>
              <h2 className="text-4xl font-bold text-foreground">Benefit Anggota HIMASTA</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              <div className="bg-card p-6 rounded border border-border text-card-foreground hover:shadow-sm transition">
                <Users className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-bold text-foreground mb-2">Networking Eksklusif</h4>
                <p className="text-sm text-muted-foreground font-light">Koneksi luas dengan alumni, profesional, dan pakar industri data.</p>
              </div>
              <div className="bg-card p-6 rounded border border-border text-card-foreground hover:shadow-sm transition">
                <Award className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-bold text-foreground mb-2">Sertifikasi Profesional</h4>
                <p className="text-sm text-muted-foreground font-light">Fasilitasi persiapan sertifikasi keahlian data science bergengsi.</p>
              </div>
              <div className="bg-card p-6 rounded border border-border text-card-foreground hover:shadow-sm transition">
                <FolderOpen className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-bold text-foreground mb-2">Portofolio Proyek</h4>
                <p className="text-sm text-muted-foreground font-light">Kesempatan terlibat dalam proyek riset riil yang memperkuat CV.</p>
              </div>
              <div className="bg-card p-6 rounded border border-border text-card-foreground hover:shadow-sm transition">
                <Target className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-bold text-foreground mb-2">Kepemimpinan</h4>
                <p className="text-sm text-muted-foreground font-light">Wadah mengasah soft skills melalui kepanitiaan dan pengurusan.</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-left space-y-8"
          >
            <div>
              <span className="text-primary font-semibold tracking-wider text-sm mb-2 uppercase block">KISAH SUKSES</span>
              <h2 className="text-4xl font-bold text-foreground">Apa Kata Alumni Kami</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-secondary/40 border border-border p-6 rounded relative text-card-foreground">
                <Quote className="h-10 w-10 text-muted/30 absolute top-6 right-6" />
                <p className="text-muted-foreground italic mb-6 relative z-10 text-sm">
                  &ldquo;HIMASTA memberikan saya fondasi teknis yang kuat sekaligus kemampuan problem-solving yang tajam. Pengalaman riset di himpunan menjadi nilai jual utama saat saya melamar pekerjaan pertama.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl">B</div>
                  <div>
                    <div className="font-bold text-foreground">Budi Santoso</div>
                    <div className="text-sm text-primary">Data Analyst di Tech Giant</div>
                  </div>
                </div>
              </div>
              <div className="bg-secondary/40 border border-border p-6 rounded relative text-card-foreground">
                <Quote className="h-10 w-10 text-muted/30 absolute top-6 right-6" />
                <p className="text-muted-foreground italic mb-6 relative z-10 text-sm">
                  &ldquo;Jaringan alumni HIMASTA sangat luar biasa. Melalui program mentoring himpunan, saya mendapatkan arahan karir yang tepat hingga akhirnya bisa memimpin tim data science.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#6e2c00] text-white rounded-full flex items-center justify-center font-bold text-xl">A</div>
                  <div>
                    <div className="font-bold text-foreground">Anisa Rahma</div>
                    <div className="text-sm text-primary">Senior Data Scientist</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. NEWS & EVENTS SECTION */}
      <section className="py-20 bg-card border-b border-border text-card-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 border-b border-border pb-6 text-left">
            <div>
              <span className="text-primary font-semibold tracking-wider text-sm mb-2 uppercase block">UPDATE TERKINI</span>
              <h2 className="text-4xl font-bold text-foreground">Event &amp; Berita Terbaru</h2>
            </div>
            <Link href="/welcome/events" className="hidden md:flex items-center gap-2 text-primary font-medium hover:underline text-sm">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative group">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Upcoming Event */}
              <div className="w-full md:w-[calc(50%-1rem)] flex bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition text-left">
                {nextEvent && eventDate ? (
                  <div className="bg-primary text-center p-6 flex flex-col justify-center min-w-[120px] items-center text-primary-foreground">
                    <div className="text-primary-foreground/80 font-bold text-sm uppercase">{eventDate[1]}</div>
                    <div className="text-3xl font-bold text-white mt-1 leading-none">{eventDate[0]}</div>
                  </div>
                ) : (
                  <div className="bg-primary text-center p-6 flex flex-col justify-center min-w-[120px] items-center text-primary-foreground">
                    <div className="text-primary-foreground/80 font-bold text-sm uppercase">Okt</div>
                    <div className="text-3xl font-bold text-white mt-1 leading-none">25</div>
                  </div>
                )}
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-primary font-semibold mb-2 uppercase tracking-wide">Upcoming Event</div>
                    <h3 className="text-xl font-bold text-foreground mb-2 leading-snug">
                      {nextEvent?.name ?? 'Workshop Machine Learning: From Zero to Hero'}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {nextEvent?.description ?? 'Pelajari fundamental machine learning dengan studi kasus nyata bersama praktisi ahli.'}
                    </p>
                  </div>
                  <Link href="/welcome/events" className="text-primary font-medium text-sm hover:underline mt-4 block">
                    Daftar Sekarang →
                  </Link>
                </div>
              </div>

              {/* News */}
              <div className="w-full md:w-[calc(50%-1rem)] flex bg-background rounded-xl border border-border overflow-hidden hover:shadow-md transition text-left">
                <div className="h-48 md:h-auto md:w-1/3 bg-secondary flex items-center justify-center text-primary text-4xl shrink-0">
                  <Trophy className="h-10 w-10" />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-[#4b1c00] dark:text-amber-400 font-semibold mb-2 uppercase tracking-wide">Berita Utama</div>
                    <h3 className="text-xl font-bold text-foreground mb-2 leading-snug">HIMASTA Juara 1 National Data Competition</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">Tim delegasi HIMASTA berhasil menyisihkan 50+ universitas lain dalam kompetisi data nasional.</p>
                  </div>
                  <span className="text-primary font-medium text-sm mt-4 block">Baca Selengkapnya →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA (With Background Image) */}
      <section className="relative py-20 bg-primary text-center px-6 overflow-hidden">
        {/* Background Image for CTA Section */}
        <Image
          src="/tossing-hand team work.jpg"
          alt="CTA Background"
          fill
          className="absolute inset-0 object-cover opacity-25 mix-blend-overlay pointer-events-none"
        />
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto space-y-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">Siap Menjadi Bagian dari Revolusi Data?</h2>
          <p className="text-xl text-primary-foreground/80 font-light">Kembangkan potensimu dan wujudkan inovasi berdampak nyata bersama komunitas data science terbaik.</p>
          <div className="pt-4">
            <Link href="/register" className="bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition shadow-lg inline-block">
              Bergabung dengan HIMASTA Sekarang
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-secondary text-muted-foreground pt-16 pb-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12 text-left">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="relative h-7 w-7 overflow-hidden bg-white rounded p-0.5 shrink-0">
                  <Image src="/himasta-logo.png" alt="Logo HIMASTA" fill className="object-contain" />
                </div>
                HIMASTA
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                Wadah kolaborasi mahasiswa Data Science untuk mengembangkan potensi teknis, kepemimpinan, dan dampak nyata bagi industri.
              </p>
              <div className="flex gap-4">
                <span className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition cursor-pointer">
                  <span className="text-xs font-bold font-mono">FB</span>
                </span>
                <span className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition cursor-pointer">
                  <span className="text-xs font-bold font-mono">IG</span>
                </span>
                <span className="w-10 h-10 rounded-full bg-background flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition cursor-pointer">
                  <span className="text-xs font-bold font-mono">LN</span>
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Tautan Cepat</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/welcome" className="hover:text-primary transition font-light">Beranda</Link></li>
                <li><a href="#divisi" className="hover:text-primary transition font-light">Program Kerja</a></li>
                <li><Link href="/welcome/events" className="hover:text-primary transition font-light">Berita &amp; Event</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Informasi</h4>
              <ul className="space-y-3 text-sm font-light">
                <li><span className="hover:text-primary transition cursor-pointer">Kebijakan Privasi</span></li>
                <li><span className="hover:text-primary transition cursor-pointer">Syarat &amp; Ketentuan</span></li>
                <li><span className="hover:text-primary transition cursor-pointer">FAQ</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Hubungi Kami</h4>
              <ul className="space-y-4 text-sm font-light">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Gedung Jurusan Statistika, Kampus Pusat.<br/>Jl. Kolonel Masturi No.71, Cimahi.</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span>info@himasta.org</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>+62 123 4567 890</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-center text-muted-foreground/60 text-sm pt-8 border-t border-border">
            © 2026 HIMASTA Data Science. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
