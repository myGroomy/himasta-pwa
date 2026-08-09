'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  QrCode, FileClock, PartyPopper, CalendarDays, Globe,
  CalendarClock, Megaphone, Settings, ArrowUp, ArrowDown, UserCheck, X
} from 'lucide-react'
import { ROLE_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { timeAgo } from '@/lib/utils'
import sanitizeHtml from 'sanitize-html'
import { toast } from '@/components/ui/use-toast'
import { DateTimeWidget } from '@/components/shared/date-time-widget'
import {
  AnnouncementDialog,
  type AnnouncementDialogData,
} from '@/components/shared/announcement-dialog'

type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  nim: string | null
  divisionId: string | null
}

type AnnouncementData = {
  id: string
  title: string
  content: string
  category: string
  scope: string
  publishedAt: Date | string | null
  createdAt: Date | string
  author: {
    name: string
  }
  division?: {
    name: string
  } | null
}

type GridItemConfig = {
  id: string
  label: string
  href: string
  visible: boolean
  iconName: 'kegiatan' | 'kalender' | 'landing' | 'izin' | 'event' | 'piket'
}

const ICON_MAP = {
  kegiatan: CalendarClock,
  kalender: CalendarDays,
  landing: Globe,
  izin: FileClock,
  event: PartyPopper,
  piket: UserCheck,
}

const DEFAULT_GRID: GridItemConfig[] = [
  { id: 'kegiatan', label: 'Kegiatan', href: '/kegiatan', visible: true, iconName: 'kegiatan' },
  { id: 'kalender', label: 'Kalender', href: '/kalender', visible: true, iconName: 'kalender' },
  { id: 'landing', label: 'Landing Page', href: '/welcome', visible: true, iconName: 'landing' },
  { id: 'izin', label: 'Izin', href: '/izin', visible: true, iconName: 'izin' },
  { id: 'event', label: 'Event', href: '/events', visible: true, iconName: 'event' },
  { id: 'piket', label: 'Piket Sekre', href: '/piket', visible: true, iconName: 'piket' },
]

export function HomePortalView({
  user,
  initialAnnouncements
}: {
  user: SessionUser
  initialAnnouncements: AnnouncementData[]
}) {
  const [filter, setFilter] = useState<'ALL' | 'DIVISION' | 'AKADEMIK'>('ALL')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDialogData | null>(null)
  
  // Custom Grid State
  const [gridItems, setGridItems] = useState<GridItemConfig[]>(DEFAULT_GRID)
  const [tempGridItems, setTempGridItems] = useState<GridItemConfig[]>([])
  const [showCustomize, setShowCustomize] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('himasta-portal-grid-config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GridItemConfig[]
        const merged = DEFAULT_GRID.map(def => {
          const match = parsed.find(p => p.id === def.id)
          return match ? { ...def, visible: match.visible } : def
        })
        const sorted = [...merged].sort((a, b) => {
          const indexA = parsed.findIndex(p => p.id === a.id)
          const indexB = parsed.findIndex(p => p.id === b.id)
          return (indexA !== -1 ? indexA : 99) - (indexB !== -1 ? indexB : 99)
        })
        setGridItems(sorted)
      } catch (e) {
        setGridItems(DEFAULT_GRID)
      }
    }
  }, [])

  // Open customize popup and clone state
  const openCustomize = () => {
    setTempGridItems([...gridItems])
    setShowCustomize(true)
  }

  // Toggle visibility in customize view
  const toggleVisibility = (id: string) => {
    setTempGridItems(prev =>
      prev.map(item => (item.id === id ? { ...item, visible: !item.visible } : item))
    )
  }

  // Move item position in customize view
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= tempGridItems.length) return

    const updated = [...tempGridItems]
    const temp = updated[index]
    updated[index] = updated[nextIndex]
    updated[nextIndex] = temp
    setTempGridItems(updated)
  }

  // Save customize changes
  const saveCustomization = () => {
    setGridItems(tempGridItems)
    localStorage.setItem('himasta-portal-grid-config', JSON.stringify(tempGridItems))
    setShowCustomize(false)
    toast({ title: 'Grid Akses Cepat diperbarui', variant: 'success' })
  }

  const announcements = initialAnnouncements.filter((a) => {
    if (filter === 'ALL') return true
    if (filter === 'DIVISION') return a.scope === 'DIVISION'
    if (filter === 'AKADEMIK') return a.category?.toLowerCase() === 'akademik'
    return true
  })

  const CATEGORY_BADGE: Record<string, string> = {
    event: 'success',
    beasiswa: 'info',
    akademik: 'warning',
    organisasi: 'secondary',
  }

  const CATEGORY_LABEL: Record<string, string> = {
    event: 'Event',
    beasiswa: 'Beasiswa',
    akademik: 'Akademik',
    organisasi: 'Organisasi',
  }

  return (
    <div className="space-y-6 px-4 pt-2 pb-6 md:px-0 max-w-4xl mx-auto">
      {/* Welcome Banner + DateTime Widget */}
      <section className="relative overflow-hidden bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-foreground">Selamat datang, {user.name}</h2>
            <p className="text-sm text-muted-foreground">
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
              {user.divisionId ? ' · Workspace Divisi Anda' : ' · Anggota HIMASTA'}
            </p>
          </div>
          <DateTimeWidget />
        </div>
      </section>

      {/* Quick Actions (Scan & Buat Pengumuman) */}
      <section className="grid grid-cols-2 gap-4">
        <Button asChild className="h-12 rounded-lg bg-primary text-primary-foreground font-semibold tracking-wide shadow-sm flex items-center justify-center gap-2 hover:opacity-90">
          <Link href="/kegiatan/scan">
            <QrCode className="h-5 w-5" />
            Scan Kegiatan
          </Link>
        </Button>
        {(user.role === 'KADIV' || user.role === 'BPH') ? (
          <Button asChild variant="outline" className="h-12 rounded-lg bg-background text-primary border-border font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-secondary">
            <Link href="/announcements/new">
              <Megaphone className="h-5 w-5" />
              Buat Pengumuman
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="h-12 rounded-lg bg-background text-primary border-border font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-secondary">
            <Link href="/izin">
              <FileClock className="h-5 w-5" />
              Ajukan Izin
            </Link>
          </Button>
        )}
      </section>

      {/* Main Menu Grid (Akses Cepat) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Akses Cepat</h3>
          <Button variant="ghost" size="sm" onClick={openCustomize} className="text-xs gap-1.5 h-8">
            <Settings className="h-3.5 w-3.5" /> Kustomisasi
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(mounted ? gridItems : DEFAULT_GRID)
            .filter((item) => item.visible)
            .map((item) => {
              const IconComp = ICON_MAP[item.iconName]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all shadow-none hover:shadow-sm"
                >
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-muted-foreground group-hover:text-primary">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground tracking-tight text-center">{item.label}</span>
                </Link>
              )
            })}
          {(mounted ? gridItems : DEFAULT_GRID).filter((item) => item.visible).length === 0 && (
            <div className="col-span-3 py-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-card">
              Tidak ada fitur terpilih. Klik Kustomisasi untuk mengaktifkan.
            </div>
          )}
        </div>
      </section>

      {/* Feed Pengumuman */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Pengumuman</h3>
          <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-secondary">
            <Link href="/announcements">Lihat Semua →</Link>
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${filter === 'ALL'
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-background border-border text-muted-foreground hover:bg-secondary'
              }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('DIVISION')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${filter === 'DIVISION'
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-background border-border text-muted-foreground hover:bg-secondary'
              }`}
          >
            Divisi
          </button>
          <button
            onClick={() => setFilter('AKADEMIK')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${filter === 'AKADEMIK'
                ? 'bg-primary text-primary-foreground border-transparent'
                : 'bg-background border-border text-muted-foreground hover:bg-secondary'
              }`}
          >
            Akademik
          </button>
        </div>

        {/* Announcement List */}
        <div className="flex flex-col gap-4">
          {announcements.length === 0 ? (
            <Card className="border border-border">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground text-sm">
                Belum ada pengumuman untuk filter ini.
              </CardContent>
            </Card>
          ) : (
            announcements.slice(0, 4).map((a) => {
              const initials = a.author.name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase() ?? '')
                .join('')

              return (
                <Card
                  key={a.id}
                  onClick={() => setSelectedAnnouncement(a)}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors shadow-none hover:shadow-sm cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant={a.scope === 'GENERAL' ? 'outline' : 'secondary'}>
                        {a.scope === 'GENERAL' ? 'General' : (a.division?.name ?? 'Divisi')}
                      </Badge>
                      {a.category && CATEGORY_LABEL[a.category] && (
                        <Badge variant={CATEGORY_BADGE[a.category] as any ?? 'default'}>
                          {CATEGORY_LABEL[a.category]}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {timeAgo(a.publishedAt ? new Date(a.publishedAt) : new Date(a.createdAt))}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground mb-1 text-base">{a.title}</h4>
                  <div
                    className="text-muted-foreground text-xs line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(a.content, {
                        allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
                      }),
                    }}
                  />
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border text-[11px] text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{a.author.name}</span>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </section>

      <AnnouncementDialog
        announcement={selectedAnnouncement}
        open={!!selectedAnnouncement}
        onOpenChange={(open) => !open && setSelectedAnnouncement(null)}
      />

      {/* Customize Grid Overlay */}
      {showCustomize && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col transform transition-all duration-300">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Kustomisasi Menu</h3>
              <button
                onClick={() => setShowCustomize(false)}
                aria-label="Tutup"
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-2">
                Atur fitur yang tampil dan urutan posisinya di halaman utama.
              </p>
              {tempGridItems.map((item, idx) => {
                const IconComp = ICON_MAP[item.iconName]
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2.5">
                      <IconComp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(item.id)}
                        className={`px-2 py-1 text-[10px] font-bold rounded border transition-colors ${
                          item.visible
                            ? 'bg-primary text-primary-foreground border-transparent'
                            : 'bg-background text-muted-foreground'
                        }`}
                      >
                        {item.visible ? 'Tampil' : 'Sembunyikan'}
                      </button>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === tempGridItems.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/20">
              <Button variant="ghost" size="sm" onClick={() => setTempGridItems(DEFAULT_GRID)}>
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCustomize(false)}>
                Batal
              </Button>
              <Button size="sm" onClick={saveCustomization}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
