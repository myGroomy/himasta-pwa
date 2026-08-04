'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home, Target, Building2, User, MoreHorizontal,
  Search, FolderOpen, ShieldCheck, BarChart3,
  History, MessageSquarePlus, LogOut, ChevronRight, X,
  CalendarDays, PartyPopper, FileClock, QrCode, Megaphone,
  Bell, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SessionUser } from '@/lib/auth'

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

export function BottomNav({ user, divisions }: { user: SessionUser; divisions: NavDivision[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showMoreSheet, setShowMoreSheet] = useState(false)
  const [showWorkspaceSheet, setShowWorkspaceSheet] = useState(false)

  const isBPH = user.role === 'BPH'
  const isKadiv = user.role === 'KADIV'
  const isDosen = user.role === 'DOSEN'
  const isAdmin = isBPH || isKadiv

  // Dynamic tab mapping per role (Max 5 mobile, 10 desktop)
  const getMainTabs = (): TabItem[] => {
    if (isBPH) {
      return [
        { href: '/', label: 'Portal', icon: Home },
        { href: '/admin/approval', label: 'Approval', icon: ShieldCheck },
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/proker', label: 'Proker', icon: Target },
        { href: '/announcements', label: 'Pengumuman', icon: Megaphone, responsive: 'desktop' },
        { href: '/absensi', label: 'Absensi', icon: QrCode, responsive: 'desktop' },
        { href: '/dokumen', label: 'Dokumen', icon: FolderOpen, responsive: 'desktop' },
        { href: '/events', label: 'Event', icon: PartyPopper, responsive: 'desktop' },
        { href: '/admin/users', label: 'Anggota', icon: Users, responsive: 'desktop' },
        { key: 'more', label: 'Lainnya', icon: MoreHorizontal, action: () => setShowMoreSheet(true) },
      ]
    }
    if (isKadiv) {
      return [
        { href: '/', label: 'Portal', icon: Home },
        { href: '/proker', label: 'Proker', icon: Target },
        { href: '/admin/approval', label: 'Approval', icon: ShieldCheck },
        { href: '/absensi', label: 'Absensi', icon: QrCode },
        { href: '/announcements', label: 'Pengumuman', icon: Megaphone, responsive: 'desktop' },
        { href: '/dokumen', label: 'Dokumen', icon: FolderOpen, responsive: 'desktop' },
        { href: '/events', label: 'Event', icon: PartyPopper, responsive: 'desktop' },
        { href: '/kalender', label: 'Kalender', icon: CalendarDays, responsive: 'desktop' },
        { href: '/direktori', label: 'Direktori', icon: Users, responsive: 'desktop' },
        { key: 'more', label: 'Lainnya', icon: MoreHorizontal, action: () => setShowMoreSheet(true) },
      ]
    }
    if (isDosen) {
      return [
        { href: '/', label: 'Portal', icon: Home },
        { href: '/announcements', label: 'Pengumuman', icon: Megaphone },
        { href: '/dokumen', label: 'Dokumen', icon: FolderOpen },
        { href: '/proker', label: 'Proker', icon: Target },
        { href: '/absensi', label: 'Absensi', icon: QrCode, responsive: 'desktop' },
        { href: '/events', label: 'Event', icon: PartyPopper, responsive: 'desktop' },
        { href: '/kalender', label: 'Kalender', icon: CalendarDays, responsive: 'desktop' },
        { href: '/direktori', label: 'Direktori', icon: Users, responsive: 'desktop' },
        { href: '/search', label: 'Cari', icon: Search, responsive: 'desktop' },
        { key: 'more', label: 'Lainnya', icon: MoreHorizontal, action: () => setShowMoreSheet(true) },
      ]
    }
    // Default: ANGGOTA
    return [
      { href: '/', label: 'Portal', icon: Home },
      { href: '/absensi', label: 'Absensi', icon: QrCode },
      { href: '/proker', label: 'Proker', icon: Target },
      { href: '/events', label: 'Event', icon: PartyPopper },
      { href: '/announcements', label: 'Pengumuman', icon: Megaphone, responsive: 'desktop' },
      { href: '/dokumen', label: 'Dokumen', icon: FolderOpen, responsive: 'desktop' },
      { href: '/kalender', label: 'Kalender', icon: CalendarDays, responsive: 'desktop' },
      { href: '/direktori', label: 'Direktori', icon: Users, responsive: 'desktop' },
      { href: '/izin', label: 'Izin', icon: FileClock, responsive: 'desktop' },
      { key: 'more', label: 'Lainnya', icon: MoreHorizontal, action: () => setShowMoreSheet(true) },
    ]
  }

  const mainTabs = getMainTabs()

  const allFeatures = [
    { href: '/announcements', label: 'Pengumuman', icon: Megaphone, color: 'text-pastel-green-foreground bg-pastel-green' },
    { href: '/absensi', label: 'Absensi', icon: QrCode, color: 'text-pastel-blue-foreground bg-pastel-blue' },
    { href: '/dokumen', label: 'Dokumen', icon: FolderOpen, color: 'text-foreground bg-secondary border border-[#EAEAEA]' },
    { href: '/events', label: 'Event', icon: PartyPopper, color: 'text-pastel-yellow-foreground bg-pastel-yellow' },
    { href: '/kalender', label: 'Kalender', icon: CalendarDays, color: 'text-foreground bg-secondary border border-[#EAEAEA]' },
    { href: '/direktori', label: 'Direktori', icon: Users, color: 'text-pastel-blue-foreground bg-pastel-blue' },
    { href: '/izin', label: 'Izin', icon: FileClock, color: 'text-foreground bg-secondary border border-[#EAEAEA]' },
    { href: '/search', label: 'Cari', icon: Search, color: 'text-foreground bg-secondary border border-[#EAEAEA]' },
  ]

  const adminFeatures = [
    { href: '/admin/approval', label: 'Approval Center', icon: ShieldCheck, color: 'text-pastel-green-foreground bg-pastel-green' },
    { href: '/admin/analytics', label: 'Analytics & Report', icon: BarChart3, color: 'text-pastel-blue-foreground bg-pastel-blue', bphOnly: true },
    { href: '/admin/users', label: 'Kelola Anggota', icon: Users, color: 'text-pastel-blue-foreground bg-pastel-blue', bphOnly: true },
    { href: '/admin/periode', label: 'Manajemen Periode', icon: History, color: 'text-foreground bg-secondary border border-[#EAEAEA]', bphOnly: true },
  ]

  return (
    <>
      {/* Bottom Navigation Bar - Adaptive (5 mobile, up to 10 desktop) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 pointer-events-none md:p-4">
        <nav className="pointer-events-auto mx-auto flex h-16 w-full max-w-md md:max-w-4xl lg:max-w-5xl items-center justify-around rounded-3xl border border-[#EAEAEA] bg-background/95 px-2 py-1 backdrop-blur-xl shadow-none text-muted-foreground transition-all duration-300">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            const active = tab.href ? (tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)) : false
            const visibilityClass = tab.responsive === 'desktop' ? 'hidden md:flex' : 'flex'

            if (tab.action) {
              return (
                <button key={tab.label} onClick={tab.action} className={cn("flex-1 flex-col items-center justify-center gap-1 group py-1", visibilityClass)}>
                  <div className="flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 group-hover:bg-secondary">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">{tab.label}</span>
                </button>
              )
            }

            return (
              <Link key={tab.href} href={tab.href!} className={cn("flex-1 flex-col items-center justify-center gap-1 group py-1", visibilityClass)}>
                <div className={cn('flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ease-out', active ? 'bg-secondary text-foreground font-semibold' : 'group-hover:bg-secondary text-muted-foreground group-hover:text-foreground')}>
                  <Icon className={cn('h-5 w-5', active ? 'text-foreground' : 'text-muted-foreground')} />
                </div>
                <span className={cn('text-[10px] tracking-tight transition-colors', active ? 'text-foreground font-bold' : 'text-muted-foreground font-medium group-hover:text-foreground')}>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sub-Menu Drawer: Workspace Divisi */}
      {showWorkspaceSheet && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
          <div className="rounded-t-3xl border-t border-[#EAEAEA] bg-background p-5 text-foreground space-y-4 max-h-[80vh] overflow-y-auto max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pastel-blue text-pastel-blue-foreground">
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
                <Link key={d.id} href={`/divisi/${d.slug}`} onClick={() => setShowWorkspaceSheet(false)} className="flex items-center justify-between rounded-xl border border-[#EAEAEA] bg-background p-3.5 hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground font-bold text-xs border border-[#EAEAEA]">{d.name.slice(0, 2)}</div>
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
          <div className="rounded-t-3xl border-t border-[#EAEAEA] bg-background p-5 text-foreground space-y-4 max-h-[85vh] overflow-y-auto max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary text-foreground border border-[#EAEAEA]">
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
                {allFeatures.map(f => {
                  const inBottom = mainTabs.find(t => t.href === f.href)
                  const hiddenClass = inBottom ? (inBottom.responsive === 'desktop' ? ' md:hidden' : ' hidden') : ''
                  
                  return (
                    <Link key={f.href} href={f.href} onClick={() => setShowMoreSheet(false)} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#EAEAEA] bg-background p-3 text-center text-xs font-medium hover:bg-secondary transition-colors${hiddenClass}`}>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${f.color}`}>
                        <f.icon className="h-4 w-4" />
                      </div>
                      {f.label}
                    </Link>
                  )
                })}
                <button onClick={() => { setShowMoreSheet(false); setShowWorkspaceSheet(true); }} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#EAEAEA] bg-background p-3 text-center text-xs font-medium hover:bg-secondary transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-blue text-pastel-blue-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>
                  Divisi
                </button>
              </div>
            </div>

            {/* BPH or KADIV Administrative Tools */}
            {isAdmin && (
              <div className="space-y-2 pt-3 border-t border-[#EAEAEA]">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider px-1">{isBPH ? 'Fitur Pengurus BPH' : 'Fitur Kadiv'}</p>
                <div className="space-y-1.5">
                  {adminFeatures.map(f => {
                    if (f.bphOnly && !isBPH) return null;
                    const inBottom = mainTabs.find(t => t.href === f.href);
                    const hiddenClass = inBottom ? (inBottom.responsive === 'desktop' ? ' md:hidden' : ' hidden') : '';

                    return (
                      <Link key={f.href} href={f.href} onClick={() => setShowMoreSheet(false)} className={`flex items-center justify-between rounded-xl bg-secondary p-3 text-sm font-medium hover:bg-[#EAEAEA] transition-colors${hiddenClass}`}>
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
    </>
  )
}
