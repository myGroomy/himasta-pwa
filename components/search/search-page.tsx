'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Filter, Megaphone, FolderOpen, Target, PartyPopper, X, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

type SearchResult = {
  type: string
  id: string
  title: string
  excerpt: string
  href: string
  divisionName?: string
  createdAt: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  Pengumuman: Megaphone,
  Dokumen: FolderOpen,
  Proker: Target,
  Event: PartyPopper,
}

const TYPE_COLORS: Record<string, string> = {
  Pengumuman: 'bg-blue-100 text-blue-700',
  Dokumen: 'bg-violet-100 text-violet-700',
  Proker: 'bg-amber-100 text-amber-700',
  Event: 'bg-green-100 text-green-700',
}

const TYPES = ['all', 'pengumuman', 'dokumen', 'proker', 'event']
const TYPE_LABELS: Record<string, string> = {
  all: 'Semua', pengumuman: 'Pengumuman', dokumen: 'Dokumen', proker: 'Proker', event: 'Event'
}

export function SearchPage({ divisions }: { divisions: { id: string; name: string }[] }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [divisionId, setDivisionId] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
        setTotal(data.total)
        setSearched(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(query, type, divisionId)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, type, divisionId, doSearch])

  // Focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  function highlightText(text: string, q: string) {
    if (!q) return text
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((p, i) =>
      regex.test(p) ? <mark key={i} className="bg-yellow-200 rounded px-0.5">{p}</mark> : p
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Cari pengumuman, dokumen, proker, event..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-2xl border-2 bg-background py-3.5 pl-12 pr-12 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-0 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex rounded-lg border bg-background overflow-hidden">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={divisionId}
            onChange={e => setDivisionId(e.target.value)}
            className="rounded-lg border bg-background px-2.5 py-1.5 text-sm"
          >
            <option value="">Semua Divisi</option>
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Search className="h-12 w-12 opacity-30" />
          <p className="font-medium">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
          <p className="text-sm">Coba gunakan kata kunci yang berbeda atau perluas filter</p>
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            {total} hasil ditemukan untuk <strong>&ldquo;{query}&rdquo;</strong>
          </p>
          <div className="space-y-2">
            {results.map(r => {
              const Icon = TYPE_ICONS[r.type] ?? Search
              const colorClass = TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-700'
              return (
                <Link
                  key={`${r.type}-${r.id}`}
                  href={r.href}
                  className="block rounded-xl border bg-card p-4 hover:bg-accent/50 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${colorClass}`}>
                      <Icon className="h-3 w-3" />
                      {r.type}
                    </span>
                    {r.divisionName && (
                      <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        {r.divisionName}
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {format(new Date(r.createdAt), 'd MMM yyyy', { locale: id })}
                    </div>
                  </div>
                  <h3 className="mt-2 font-semibold group-hover:text-primary transition-colors">
                    {highlightText(r.title, query)}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {highlightText(r.excerpt, query)}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {!searched && !loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Search className="h-12 w-12 opacity-20" />
          <p className="font-medium">Cari di seluruh konten HIMASTA</p>
          <p className="text-sm max-w-sm">Pengumuman, dokumen, program kerja, dan event tersedia dalam satu pencarian</p>
        </div>
      )}
    </div>
  )
}
