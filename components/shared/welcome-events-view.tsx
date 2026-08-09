'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  CalendarDays, MapPin, Clock, Search, Loader2,
  LogIn, LayoutGrid, CheckCircle2, Ticket, ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { toast } from '@/components/ui/use-toast'

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
  division: { name: string } | null
  _count: { registrations: number }
}

type WelcomeEventsViewProps = {
  user: { id: string; name: string; email: string } | null
  initialEvents: EventData[]
  initialRegisteredIds: string[]
}

export function WelcomeEventsView({ user, initialEvents, initialRegisteredIds }: WelcomeEventsViewProps) {
  const [registeredIds, setRegisteredIds] = useState<string[]>(initialRegisteredIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null)
  
  // Registration Form State
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [qrToken, setQrToken] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Filter events
  const filteredEvents = initialEvents.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Generate QR Code dynamically
  useEffect(() => {
    if (!qrToken) return
    let active = true
    import('qrcode')
      .then((mod) => mod.toDataURL(qrToken))
      .then((url) => {
        if (active) setQrDataUrl(url)
      })
      .catch((err) => console.error(err))

    return () => {
      active = false
    }
  }, [qrToken])

  // Internal Registration
  async function handleInternalRegister(eventId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: 'POST' })
      const data = await res.json().catch(() => null)

      if (res.ok) {
        setRegisteredIds((prev) => [...prev, eventId])
        toast({ title: 'Berhasil terdaftar!', description: 'Anda telah terdaftar menggunakan akun portal.', variant: 'success' })
      } else {
        toast({ title: 'Gagal daftar', description: data?.error || 'Terjadi kesalahan.', variant: 'destructive' })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // External Registration
  async function handleExternalRegister(e: React.FormEvent, eventId: string) {
    e.preventDefault()
    if (!name || !email) {
      toast({ title: 'Gagal', description: 'Nama dan email wajib diisi', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/events/register-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, name, email, phone: phone || null }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        setQrToken(data.registration?.qrToken || null)
        toast({
          title: 'Pendaftaran Berhasil!',
          description: 'Bukti pendaftaran dan QR Code berhasil digenerate.',
          variant: 'success',
        })
      } else {
        toast({ title: 'Gagal', description: data?.error || 'Pendaftaran gagal.', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col transition-colors duration-300">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground text-xs py-2 px-6 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            Jl. Kolonel Masturi No.71, Cimahi
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-[10px] uppercase font-bold tracking-widest">Event Umum HIMASTA</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50 px-6 py-4 flex justify-between items-center transition-colors">
        <div className="flex items-center">
          <Link href="/welcome" className="text-2xl font-bold text-primary flex items-center gap-2.5">
            <div className="relative h-8 w-8 overflow-hidden bg-white rounded p-0.5 shrink-0">
              <Image src="/himasta-logo.webp" alt="Logo HIMASTA" fill className="object-contain" />
            </div>
            HIMASTA
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/welcome" className="text-muted-foreground hover:text-primary transition">Beranda</Link>
          <Link href="/welcome/events" className="text-primary border-b-2 border-primary pb-1">Event Umum</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href="/"
              aria-label="Dashboard"
              title="Dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              <LayoutGrid className="h-5 w-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              aria-label="Masuk Portal"
              title="Masuk Portal"
              className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              <LogIn className="h-5 w-5" />
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-left space-y-3"
          >
            <span className="text-primary font-semibold tracking-wider text-sm uppercase block">Update Terkini</span>
            <h1 className="text-4xl font-bold text-foreground">Direktori Event Umum</h1>
            <p className="text-muted-foreground font-light max-w-2xl">
              Jelajahi berbagai seminar, workshop, dan pelatihan sains data gratis maupun berbayar yang diselenggarakan oleh HIMASTA ULBI.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 relative max-w-md"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Cari event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-[44px] rounded border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-0 text-sm"
            />
          </motion.div>

          {/* Grid List */}
          {filteredEvents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 border border-dashed border-border rounded-xl bg-secondary/30"
            >
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-semibold text-sm text-foreground">Tidak ada event ditemukan</p>
              <p className="text-xs text-muted-foreground mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((e) => {
                const isReg = registeredIds.includes(e.id)
                return (
                  <motion.div
                    key={e.id}
                    variants={itemVariants}
                    className="bg-card rounded border border-border overflow-hidden hover:border-primary transition-all flex flex-col h-full group hover:shadow-md"
                  >
                    <div className="p-6 flex-grow flex flex-col justify-between text-left">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">
                            {e.division?.name ?? 'General'}
                          </span>
                          {isReg && (
                            <Badge variant="success" className="text-[9px] px-2 py-0.5 font-bold uppercase">
                              Terdaftar
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-bold text-lg text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                          {e.name}
                        </h3>

                        <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-light mt-4">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
                            {format(new Date(e.startTime), 'EEEE, dd MMMM yyyy', { locale: id })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                            {format(new Date(e.startTime), 'HH:mm')} WIB
                            {e.endTime && ` - ${format(new Date(e.endTime), 'HH:mm')} WIB`}
                          </span>
                          {e.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="truncate">{e.location}</span>
                            </span>
                          )}
                        </div>

                        {e.description && (
                          <p className="text-xs text-muted-foreground font-light leading-relaxed mt-4 line-clamp-3">
                            {e.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-border">
                        <Button
                          onClick={() => {
                            setSelectedEvent(e)
                            setQrToken(null)
                            setQrDataUrl(null)
                            setName('')
                            setEmail('')
                            setPhone('')
                          }}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
                        >
                          Lihat Detail / Daftar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </main>

      {/* Details & Registration Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
            <DialogHeader className="text-left">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {selectedEvent.division?.name ?? 'General'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedEvent._count.registrations} Terdaftar
                  {selectedEvent.capacity ? ` / ${selectedEvent.capacity} kuota` : ''}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold leading-tight text-foreground">{selectedEvent.name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-light mt-1 flex flex-col gap-1">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  {format(new Date(selectedEvent.startTime), 'EEEE, dd MMMM yyyy', { locale: id })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {format(new Date(selectedEvent.startTime), 'HH:mm')} WIB
                  {selectedEvent.endTime && ` - ${format(new Date(selectedEvent.endTime), 'HH:mm')} WIB`}
                </span>
                {selectedEvent.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {selectedEvent.location}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent.description && (
              <div className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground font-light whitespace-pre-wrap">
                <h4 className="font-bold text-foreground mb-2">Deskripsi Lengkap</h4>
                {selectedEvent.description}
              </div>
            )}

            {/* Registration Area */}
            <div className="border-t border-border pt-4 mt-2">
              {registeredIds.includes(selectedEvent.id) ? (
                <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-foreground">Anda Sudah Terdaftar</p>
                  <p className="text-xs text-muted-foreground">Tunjukkan QR Code Anda di menu dashboard saat hari-H untuk absensi.</p>
                </div>
              ) : qrToken ? (
                // External registration success QR code display
                <div className="rounded bg-secondary border border-border p-5 text-center space-y-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-foreground">Registrasi Sukses!</p>
                  <p className="text-xs text-muted-foreground">Simpan QR Code di bawah untuk absensi kehadiran:</p>
                  <div className="flex items-center justify-center p-3 bg-background rounded max-w-[200px] mx-auto">
                    {qrDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={qrDataUrl} alt="QR Code Pendaftaran" className="h-40 w-40" />
                    ) : (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground break-all select-all">{qrToken}</p>
                </div>
              ) : user ? (
                // Logged in user signup
                <div className="bg-secondary border border-border p-4 rounded text-left space-y-3">
                  <h4 className="font-bold text-xs text-foreground">Daftar dengan Akun Anggota</h4>
                  <p className="text-[11px] text-muted-foreground font-light leading-relaxed">
                    Anda sedang login sebagai <strong className="text-foreground">{user.name}</strong> ({user.email}). Klik tombol di bawah untuk mendaftar otomatis menggunakan akun Anda.
                  </p>
                  <Button
                    onClick={() => handleInternalRegister(selectedEvent.id)}
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs border-0 h-10"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                    Daftar Sekarang
                  </Button>
                </div>
              ) : (
                // External registration form
                <form onSubmit={(e) => handleExternalRegister(e, selectedEvent.id)} className="bg-secondary border border-border p-5 rounded space-y-4 text-left">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">Formulir Pendaftaran (Eksternal / Umum)</h4>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground" htmlFor="ext-name">NAMA LENGKAP</Label>
                    <Input
                      id="ext-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Masukkan nama lengkap"
                      className="h-10 border-border bg-card text-foreground text-xs placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground" htmlFor="ext-email">EMAIL</Label>
                    <Input
                      id="ext-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="contoh@email.com"
                      className="h-10 border-border bg-card text-foreground text-xs placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground" htmlFor="ext-phone">NO. TELEPON / HP (OPSIONAL)</Label>
                    <Input
                      id="ext-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="h-10 border-border bg-card text-foreground text-xs placeholder:text-muted-foreground"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs border-0 h-10 mt-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ticket className="h-4 w-4 mr-2" />}
                    Kirim Pendaftaran
                  </Button>
                </form>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Footer */}
      <footer className="bg-secondary border-t border-border text-muted-foreground pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12 text-left">
            <div className="space-y-4">
              <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="relative h-7 w-7 overflow-hidden bg-white rounded p-0.5 shrink-0">
                  <Image src="/himasta-logo.webp" alt="Logo HIMASTA" fill className="object-contain" />
                </div>
                HIMASTA
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                Wadah kolaborasi mahasiswa Data Science untuk mengembangkan potensi teknis, kepemimpinan, dan dampak nyata bagi industri.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Tautan Cepat</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/welcome" className="hover:text-primary transition font-light">Beranda</Link></li>
                <li><Link href="/welcome/events" className="hover:text-primary transition font-light">Event Umum</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground mb-6">Kontak</h4>
              <ul className="space-y-3 text-sm font-light">
                <li>Jl. Kolonel Masturi No.71, Cimahi</li>
                <li><span className="hover:text-primary transition cursor-pointer">info@himasta.org</span></li>
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
