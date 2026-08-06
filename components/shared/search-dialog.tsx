'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Search, X, Filter, Megaphone, FolderOpen, Target, PartyPopper, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AnnouncementDialog,
  type AnnouncementDialogData,
} from '@/components/shared/announcement-dialog'

type SearchResult = {
  type: string
  id: string
  title: string
  excerpt: string
  href: string
  divisionName?: string
  createdAt: string
}

type NavDivision = {
  id: string
  name: string
  slug: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  Pengumuman: Megaphone,
  Dokumen: FolderOpen,
  Proker: Target,
  Event: PartyPopper,
}

const TYPE_COLORS: Record<string, string> = {
  Pengumuman: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Dokumen: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Proker: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Event: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
}

const TYPES = ['all', 'pengumuman', 'dokumen', 'proker', 'event']
const TYPE_LABELS: Record<string, string> = {
  all: 'Semua',
  pengumuman: 'Pengumuman',
  dokumen: 'Dokumen',
  proker: 'Proker',
  event: 'Event',
}

export function SearchDialog({ divisions = [] }: { divisions: NavDivision[] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [divisionId, setDivisionId] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  
  // Dialog detailed states for click actions
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementDialogData | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string, t: string, div: string) => {
    if (!q || q.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    setLoading(true)
    try {
      const qs = new URLSearchParams({ q, type: t })
      if (div) qs.set('divisionId', div)
      const r = await fetch(`/api/search?${qs}`)
      if (r.ok) {
        const data = await r.json()
        setResults(data.results)
        setSearched(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(query, type, divisionId)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, type, divisionId, doSearch, open])

  // Handle Result Clicking (Open Popup directly if supported)
  async function handleResultClick(r: SearchResult) {
    if (r.type === 'Pengumuman') {
      setLoadingDetail(true)
      try {
        const res = await fetch(`/api/announcements/${r.id}`)
        if (res.ok) {
          const data = await res.json()
          setSelectedAnnouncement(data.announcement)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingDetail(false)
      }
    } else if (r.type === 'Event') {
      setLoadingDetail(true)
      try {
        const res = await fetch(`/api/events/${r.id}`)
        if (res.ok) {
          const data = await res.json()
          setSelectedEvent(data.event)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingDetail(false)
      }
    } else if (r.type === 'Dokumen') {
      // Just mock document dialog state
      setSelectedDoc({
        id: r.id,
        title: r.title,
        description: r.excerpt,
        fileUrl: r.href,
        divisionName: r.divisionName,
        createdAt: r.createdAt,
      })
    } else {
      // Proker or others, navigate directly
      setOpen(false)
      window.location.href = r.href
    }
  }

  function highlightText(text: string, q: string) {
    if (!q) return text
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((p, i) =>
      regex.test(p) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/80 rounded px-0.5 text-black dark:text-white">
          {p}
        </mark>
      ) : (
        p
      )
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Cari"
        className="flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[75vh]">
            {/* Input Bar */}
            <div className="flex items-center gap-2 p-3 border-b border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari pengumuman, dokumen, proker, event..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-sm text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none"
                autoFocus
              />
              {loadingDetail && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              <button
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                  setResults([])
                  setSearched(false)
                }}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Filter Controls */}
            <div className="flex flex-wrap gap-2 items-center p-3 border-b border-border bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="flex rounded-lg border bg-background overflow-hidden scale-90 origin-left">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                      type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs scale-90 origin-left">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={divisionId}
                  onChange={(e) => setDivisionId(e.target.value)}
                  className="rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold"
                >
                  <option value="">Semua Divisi</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              )}

              {!loading && searched && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                  <Search className="h-10 w-10 opacity-30" />
                  <p className="font-medium text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
                  <p className="text-xs">Coba filter divisi lain atau gunakan kata kunci alternatif.</p>
                </div>
              )}

              {!loading && searched && results.length > 0 && (
                <div className="space-y-2">
                  {results.map((r) => {
                    const Icon = TYPE_ICONS[r.type] ?? Search
                    const colorClass = TYPE_COLORS[r.type] ?? 'bg-muted text-muted-foreground'
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => handleResultClick(r)}
                        className="w-full text-left block rounded-xl border bg-card p-3.5 hover:bg-accent/40 hover:border-primary/40 transition-all group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${colorClass}`}>
                            <Icon className="h-2.5 w-2.5" />
                            {r.type}
                          </span>
                          {r.divisionName && (
                            <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {r.divisionName}
                            </span>
                          )}
                          <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {format(new Date(r.createdAt), 'd MMM yyyy', { locale: id })}
                          </div>
                        </div>
                        <h4 className="mt-2 font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                          <span>{highlightText(r.title, query)}</span>
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1 leading-normal">
                          {highlightText(r.excerpt.replace(/<[^>]*>?/gm, ''), query)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}

              {!searched && !loading && (
                <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
                  <Search className="h-10 w-10 opacity-20" />
                  <p className="font-semibold text-sm">Cari di seluruh konten HIMASTA</p>
                  <p className="text-xs max-w-xs leading-normal">Ketikkan kata kunci untuk mencari Pengumuman, Dokumen, Proker, dan Event terpadu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Detail Dialogs */}
      <AnnouncementDialog
        announcement={selectedAnnouncement}
        open={!!selectedAnnouncement}
        onOpenChange={(o) => !o && setSelectedAnnouncement(null)}
      />

      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={selectedEvent.visibility === 'PUBLIC' ? 'info' : 'secondary'}>
                  {selectedEvent.visibility}
                </Badge>
                <Badge>{selectedEvent.status}</Badge>
              </div>
              <DialogTitle className="text-xl leading-snug text-left">{selectedEvent.name}</DialogTitle>
              <DialogDescription className="text-left">
                <span className="flex items-center gap-1.5 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(selectedEvent.startTime), 'EEEE, dd MMMM yyyy - HH:mm', { locale: id })}
                </span>
                {selectedEvent.location && <span className="mt-1 block">Lokasi: {selectedEvent.location}</span>}
                <span className="mt-1 block">{selectedEvent.division?.name ?? 'General'}</span>
              </DialogDescription>
            </DialogHeader>
            {selectedEvent.description && (
              <div className="border-t border-border pt-4 text-sm text-muted-foreground whitespace-pre-wrap leading-6">
                {selectedEvent.description}
              </div>
            )}
            <div className="border-t border-border pt-4 flex justify-end">
              <Button asChild size="sm">
                <Link href={`/events`} onClick={() => { setOpen(false); setSelectedEvent(null); }}>
                  Buka Menu Event
                </Link>
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!selectedDoc} onOpenChange={(o) => !o && setSelectedDoc(null)}>
        {selectedDoc && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl leading-snug text-left">{selectedDoc.title}</DialogTitle>
              <DialogDescription className="text-left">
                Diunggah pada {format(new Date(selectedDoc.createdAt), 'dd MMMM yyyy', { locale: id })}
                {selectedDoc.divisionName ? ` · Divisi ${selectedDoc.divisionName}` : ' · General'}
              </DialogDescription>
            </DialogHeader>
            <div className="border-t border-border pt-4 text-sm text-muted-foreground leading-6">
              {selectedDoc.description ?? 'Tidak ada deskripsi tambahan.'}
            </div>
            <div className="border-t border-border pt-4 flex justify-end">
              <Button asChild>
                <Link href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer">
                  Buka File / Unduh
                </Link>
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
