'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home, Target, Building2, MoreHorizontal,
  Search, FolderOpen, ShieldCheck, BarChart3,
  History, MessageSquarePlus, MessageSquare, LogOut, ChevronRight, X,
  CalendarDays, PartyPopper, FileClock, Megaphone,
  Bell, Users, CalendarClock, User, Loader2, Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SessionUser } from '@/lib/auth'
import type { Role } from '@prisma/client'
import { Button } from '@/components/ui/button'

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
const CORE_FEATURE_COLOR = 'text-slate-700 bg-slate-100 border border-slate-200/60 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-700/60'

const FEATURES: Record<string, FeatureItem> = {
  announcements: feature('/announcements', 'Pengumuman', Megaphone, CORE_FEATURE_COLOR),
  kegiatan: feature('/kegiatan', 'Kegiatan', CalendarClock, CORE_FEATURE_COLOR),
  dokumen: feature('/dokumen', 'Dokumen', FolderOpen, CORE_FEATURE_COLOR),
  kalender: feature('/kalender', 'Kalender', CalendarDays, CORE_FEATURE_COLOR),
  direktori: feature('/direktori', 'Direktori', Users, CORE_FEATURE_COLOR),
  events: feature('/events', 'Event', PartyPopper, CORE_FEATURE_COLOR),
  proker: feature('/proker', 'Proker', Target, CORE_FEATURE_COLOR),
  izin: feature('/izin', 'Izin', FileClock, CORE_FEATURE_COLOR),
  feedback: feature('/feedback', 'Kritik & Saran', MessageSquarePlus, CORE_FEATURE_COLOR),
  diskusi: feature('/diskusi', 'Diskusi', MessageSquare, CORE_FEATURE_COLOR),
  search: feature('/search', 'Cari', Search, CORE_FEATURE_COLOR),
  profil: feature('/profil', 'Profil', User, CORE_FEATURE_COLOR),
}

const ALL_KEYS = Object.keys(FEATURES)
const ANGGOTA_KEYS = ALL_KEYS.filter(k => !['proker'].includes(k))
const DOSEN_KEYS = ALL_KEYS.filter(k => !['proker', 'izin'].includes(k))

const FEATURE_KEYS_BY_ROLE: Record<Role, string[]> = {
  BPH: [...ALL_KEYS],
  KADIV: [...ALL_KEYS],
  ANGGOTA: [...ANGGOTA_KEYS],
  DOSEN: [...DOSEN_KEYS],
}

// Fitur admin/pengurus (hanya BPH & KADIV).
const ADMIN_FEATURES: Record<Role, FeatureItem[]> = {
  BPH: [
    feature('/admin/approval', 'Approval Center', ShieldCheck, 'text-primary bg-primary/10 border border-primary/20 dark:text-primary-foreground dark:bg-primary/20'),
    feature('/admin/analytics', 'Analytics & Report', BarChart3, CORE_FEATURE_COLOR),
    feature('/admin/users', 'Kelola Anggota', Users, CORE_FEATURE_COLOR),
    feature('/admin/periode', 'Manajemen Periode', History, CORE_FEATURE_COLOR),
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
  const roleFeatures = (FEATURE_KEYS_BY_ROLE[user.role] ?? []).map(k => FEATURES[k])
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
              <button onClick={() => setShowWorkspaceSheet(false)} aria-label="Tutup" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
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
              <button onClick={() => setShowMoreSheet(false)} aria-label="Tutup" className="rounded-full p-1 text-muted-foreground hover:text-foreground">
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
    </>
  )
}
