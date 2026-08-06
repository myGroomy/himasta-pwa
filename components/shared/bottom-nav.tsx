'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home, Target, Building2, MoreHorizontal,
  Search, FolderOpen, ShieldCheck, BarChart3,
  History, MessageSquarePlus, LogOut, ChevronRight, X,
  CalendarDays, PartyPopper, FileClock, Megaphone,
  Bell, Users, Globe, CalendarClock, User, Loader2, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SessionUser } from '@/lib/auth'
import type { Role } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

function IzinFormModalInner({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [reason, setReason] = useState('')
  const [startTime, setStartTime] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTitle,
          reason,
          startTime: startTime ? new Date(startTime).toISOString() : null,
        }),
      })
      if (res.ok) {
        toast({ title: 'Izin diajukan', description: 'Menunggu persetujuan kadiv.', variant: 'success' })
        onDone()
      } else {
        const data = await res.json().catch(() => null)
        toast({ title: 'Gagal mengajukan izin', description: data?.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Terjadi kesalahan', description: 'Coba lagi nanti.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <Label htmlFor="modal-perm-session">Nama Rapat / Kegiatan</Label>
        <Input
          id="modal-perm-session"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="misal: Rapat Mingguan PSDM"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="modal-perm-reason">Alasan</Label>
        <Textarea
          id="modal-perm-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan tidak dapat hadir"
          rows={3}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="modal-perm-time">Waktu Kegiatan (opsional)</Label>
        <Input
          id="modal-perm-time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground font-semibold">
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Ajukan
        </Button>
      </div>
    </form>
  )
}

function FeedbackFormModalInner({ onDone }: { onDone: () => void }) {
  const [content, setContent] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isAnon })
      })

      if (res.ok) {
        toast({ title: 'Masukan dikirim', description: 'Terima kasih atas kritik & saran Anda.', variant: 'success' })
        onDone()
      } else {
        const data = await res.json().catch(() => null)
        toast({ title: 'Gagal mengirim', description: data?.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Terjadi kesalahan', description: 'Coba lagi nanti.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="space-y-1.5">
        <Textarea
          placeholder="Tuliskan masukan Anda di sini..."
          className="min-h-[120px] resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      <div className="flex items-center space-x-2 rounded-lg border p-3">
        <Switch
          id="modal-anon"
          checked={isAnon}
          onCheckedChange={setIsAnon}
          disabled={isSubmitting}
        />
        <Label htmlFor="modal-anon" className="flex flex-col gap-0.5 cursor-pointer">
          <span className="text-xs font-semibold">Kirim sebagai Anonim</span>
          <span className="font-normal text-[10px] text-muted-foreground">
            Nama Anda tidak akan ditampilkan kepada BPH.
          </span>
        </Label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={isSubmitting}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || !content.trim()} className="bg-primary text-primary-foreground font-semibold gap-1.5">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Kirim
        </Button>
      </div>
    </form>
  )
}

type NavDivision = {
  id: string
  name: string
  slug: string
}

type TabItem = {
  href?: string
  key?: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action?: () => void
  responsive?: 'desktop'
}

type FeatureItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function feature(
  href: string,
  label: string,
  icon: React.ComponentType<{ className?: string }>,
  color: string
): FeatureItem {
  return { href, label, icon, color }
}

// Fitur layanan yang relevan per role (yang bisa diakses role tsb).
const FEATURE_BY_ROLE: Record<Role, FeatureItem[]> = {
  BPH: [
    feature('/announcements', 'Pengumuman', Megaphone, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kegiatan', 'Kegiatan', CalendarClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/dokumen', 'Dokumen', FolderOpen, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kalender', 'Kalender', CalendarDays, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/direktori', 'Direktori', Users, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/events', 'Event', PartyPopper, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/proker', 'Proker', Target, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/izin', 'Izin', FileClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/feedback', 'Kritik & Saran', MessageSquarePlus, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/search', 'Cari', Search, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/profil', 'Profil', User, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/welcome', 'Landing Page', Globe, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
  ],
  KADIV: [
    feature('/announcements', 'Pengumuman', Megaphone, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kegiatan', 'Kegiatan', CalendarClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/dokumen', 'Dokumen', FolderOpen, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kalender', 'Kalender', CalendarDays, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/direktori', 'Direktori', Users, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/events', 'Event', PartyPopper, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/proker', 'Proker', Target, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/izin', 'Izin', FileClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/feedback', 'Kritik & Saran', MessageSquarePlus, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/search', 'Cari', Search, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/profil', 'Profil', User, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/welcome', 'Landing Page', Globe, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
  ],
  ANGGOTA: [
    feature('/announcements', 'Pengumuman', Megaphone, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kegiatan', 'Kegiatan', CalendarClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/dokumen', 'Dokumen', FolderOpen, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kalender', 'Kalender', CalendarDays, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/direktori', 'Direktori', Users, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/events', 'Event', PartyPopper, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/izin', 'Izin', FileClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/feedback', 'Kritik & Saran', MessageSquarePlus, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/search', 'Cari', Search, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/profil', 'Profil', User, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/welcome', 'Landing Page', Globe, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
  ],
  DOSEN: [
    feature('/announcements', 'Pengumuman', Megaphone, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kegiatan', 'Kegiatan', CalendarClock, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/dokumen', 'Dokumen', FolderOpen, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/kalender', 'Kalender', CalendarDays, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/direktori', 'Direktori', Users, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/events', 'Event', PartyPopper, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/feedback', 'Kritik & Saran', MessageSquarePlus, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/search', 'Cari', Search, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/profil', 'Profil', User, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/welcome', 'Landing Page', Globe, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
  ],
}

// Fitur admin/pengurus (hanya BPH & KADIV).
const ADMIN_FEATURES: Record<Role, FeatureItem[]> = {
  BPH: [
    feature('/admin/approval', 'Approval Center', ShieldCheck, 'text-primary bg-primary/10 border border-primary/20 dark:text-primary-foreground dark:bg-primary/20'),
    feature('/admin/analytics', 'Analytics & Report', BarChart3, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/admin/users', 'Kelola Anggota', Users, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
    feature('/admin/periode', 'Manajemen Periode', History, 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'),
  ],
  KADIV: [
    feature('/admin/approval', 'Approval Center', ShieldCheck, 'text-primary bg-primary/10 border border-primary/20 dark:text-primary-foreground dark:bg-primary/20'),
  ],
  ANGGOTA: [],
  DOSEN: [],
}

export function BottomNav({ user, divisions }: { user: SessionUser; divisions: NavDivision[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showMoreSheet, setShowMoreSheet] = useState(false)
  const [showWorkspaceSheet, setShowWorkspaceSheet] = useState(false)
  const [showIzinModal, setShowIzinModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  const isBPH = user.role === 'BPH'
  const isKadiv = user.role === 'KADIV'
  const isDosen = user.role === 'DOSEN'
  const isAdmin = isBPH || isKadiv

  // Dynamic tab mapping per role (Max 5 mobile, 10 desktop)
  const getMainTabs = (): TabItem[] => {
    const userDivision = divisions.find(d => d.id === user.divisionId)
    const divisionTab = userDivision
      ? { href: `/divisi/${userDivision.slug}`, label: 'Divisi', icon: Building2 }
      : { href: '/direktori', label: 'Direktori', icon: Users }

    return [
      { href: '/', label: 'Portal', icon: Home },
      { href: '/kalender', label: 'Kalender', icon: CalendarDays },
      divisionTab,
      { href: '/profil', label: 'Profil', icon: User },
      { key: 'more', label: 'Lainnya', icon: MoreHorizontal, action: () => setShowMoreSheet(true) },
    ]
  }

  const mainTabs = getMainTabs()
  const roleFeatures = FEATURE_BY_ROLE[user.role] ?? []
  const roleAdminFeatures = ADMIN_FEATURES[user.role] ?? []

  return (
    <>
      {/* Bottom Navigation Bar - Adaptive (5 mobile, up to 10 desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 pointer-events-none md:p-4">
        <nav className="pointer-events-auto mx-auto flex h-20 w-full max-w-md md:max-w-4xl lg:max-w-5xl items-center justify-around rounded-3xl border border-border bg-background/95 px-2 py-1 backdrop-blur-xl shadow-none text-muted-foreground transition-all duration-300">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            const active = tab.href ? (tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)) : false
            const visibilityClass = tab.responsive === 'desktop' ? 'hidden md:flex' : 'flex'

            if (tab.action) {
              return (
                <button key={tab.label} onClick={tab.action} className={cn("flex-1 flex-col items-center justify-center gap-1 group py-1", visibilityClass)}>
                  <div className="flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 group-hover:bg-secondary">
                    <Icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{tab.label}</span>
                </button>
              )
            }

            return (
              <Link key={tab.href} href={tab.href!} className={cn("flex-1 flex-col items-center justify-center gap-1 group py-1", visibilityClass)}>
                <div className={cn('flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ease-out', active ? 'bg-secondary text-foreground font-semibold' : 'group-hover:bg-secondary text-muted-foreground group-hover:text-foreground')}>
                  <Icon className={cn('h-6 w-6', active ? 'text-foreground' : 'text-muted-foreground')} />
                </div>
                <span className={cn('text-xs tracking-tight transition-colors', active ? 'text-foreground font-bold' : 'text-muted-foreground font-medium group-hover:text-foreground')}>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sub-Menu Drawer: Workspace Divisi */}
      {showWorkspaceSheet && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="rounded-t-3xl border-t border-border bg-background p-5 text-foreground space-y-4 max-h-[80vh] overflow-y-auto max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-foreground border border-border">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg">Workspace Divisi</h3>
              </div>
              <button onClick={() => setShowWorkspaceSheet(false)} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-2">
              {divisions.map((d) => (
                <Link key={d.id} href={`/divisi/${d.slug}`} onClick={() => setShowWorkspaceSheet(false)} className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground font-bold text-xs border border-border">{d.name.slice(0, 2)}</div>
                    <div>
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">Workspace Internal</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Menu Drawer: Lainnya / More */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="rounded-t-3xl border-t border-border bg-background p-5 text-foreground space-y-4 max-h-[85vh] overflow-y-auto max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-foreground border border-border">
                  <MoreHorizontal className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg">Menu &amp; Fitur Organisasi</h3>
              </div>
              <button onClick={() => setShowMoreSheet(false)} className="rounded-full p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Link Grid Core Features */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Layanan Utama</p>
              <div className="grid grid-cols-3 gap-2">
                {roleFeatures.map(f => {
                  const inBottom = mainTabs.find(t => t.href === f.href)
                  const hiddenClass = inBottom ? (inBottom.responsive === 'desktop' ? ' md:hidden' : ' hidden') : ''

                  if (f.href === '/izin') {
                    return (
                      <button
                        key={f.href}
                        onClick={() => { setShowMoreSheet(false); setShowIzinModal(true); }}
                        className={cn("flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center text-xs font-medium hover:bg-secondary transition-colors", hiddenClass)}
                      >
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", f.color)}>
                          <f.icon className="h-4 w-4" />
                        </div>
                        {f.label}
                      </button>
                    )
                  }

                  if (f.href === '/feedback') {
                    return (
                      <button
                        key={f.href}
                        onClick={() => { setShowMoreSheet(false); setShowFeedbackModal(true); }}
                        className={cn("flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center text-xs font-medium hover:bg-secondary transition-colors", hiddenClass)}
                      >
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", f.color)}>
                          <f.icon className="h-4 w-4" />
                        </div>
                        {f.label}
                      </button>
                    )
                  }

                  return (
                    <Link key={f.href} href={f.href} onClick={() => setShowMoreSheet(false)} className={cn("flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center text-xs font-medium hover:bg-secondary transition-colors", hiddenClass)}>
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", f.color)}>
                        <f.icon className="h-4 w-4" />
                      </div>
                      {f.label}
                    </Link>
                  )
                })}
                <button onClick={() => { setShowMoreSheet(false); setShowWorkspaceSheet(true); }} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center text-xs font-medium hover:bg-secondary transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground border border-border">
                    <Building2 className="h-4 w-4" />
                  </div>
                  Divisi
                </button>
              </div>
            </div>

            {/* BPH or KADIV Administrative Tools */}
            {isAdmin && roleAdminFeatures.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">{isBPH ? 'Fitur Pengurus BPH' : 'Fitur Kadiv'}</p>
                <div className="space-y-1.5">
                  {roleAdminFeatures.map(f => {
                    const inBottom = mainTabs.find(t => t.href === f.href)
                    const hiddenClass = inBottom ? (inBottom.responsive === 'desktop' ? ' md:hidden' : ' hidden') : ''

                    return (
                      <Link key={f.href} href={f.href} onClick={() => setShowMoreSheet(false)} className={`flex items-center justify-between rounded-xl bg-secondary p-3 text-sm font-medium dark:hover:bg-border transition-colors${hiddenClass}`}>
                        <span className="flex items-center gap-2">
                          <div className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs ${f.color}`}>
                            <f.icon className="h-3.5 w-3.5" />
                          </div>
                          {f.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Logout button */}
            <button onClick={async () => { setShowMoreSheet(false); await signOut({ redirect: false }); router.push('/'); router.refresh(); }} className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground p-3 text-sm font-semibold hover:bg-destructive/90 transition-colors">
              <LogOut className="h-4 w-4" />
              Keluar Akun
            </button>
          </div>
        </div>
      )}

      {/* Modal Pengajuan Izin */}
      {showIzinModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Ajukan Izin Rapat/Kegiatan</h3>
              <button onClick={() => setShowIzinModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <IzinFormModalInner onDone={() => setShowIzinModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Kritik & Saran */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Kritik &amp; Saran</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <FeedbackFormModalInner onDone={() => setShowFeedbackModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
