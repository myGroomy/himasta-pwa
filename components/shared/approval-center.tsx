'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { ApprovalList } from '@/components/shared/approval-list'
import { formatDateTime } from '@/lib/utils'
import { EVENT_VISIBILITY_LABELS } from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'

type AnnouncementData = {
  id: string
  title: string
  content: string
  category: string
  scope: 'GENERAL' | 'DIVISION'
  division: { id: string; name: string; slug: string } | null
  visibleToDosen: boolean
  author: { id: string; name: string; email: string; role: string }
  createdAt: string
}

type ProkerData = {
  id: string
  name: string
  description: string | null
  status: string
  estimateBudget: string | null
  startDate: string | null
  endDate: string | null
  division: { id: string; name: string; slug: string }
  proposedBy: { id: string; name: string; role: string }
  createdAt: string
}

type EventData = {
  id: string
  name: string
  description: string | null
  startTime: string
  endTime: string | null
  location: string | null
  visibility: 'INTERNAL' | 'PUBLIC'
  status: string
  division: { id: string; name: string; slug: string } | null
  createdBy: { id: string; name: string; role: string }
  createdAt: string
}

type ApprovalCenterProps = {
  announcements: AnnouncementData[]
  prokers: ProkerData[]
  events: EventData[]
  logs: {
    id: string
    action: string
    note: string | null
    createdAt: string
    actor: { id: string; name: string }
    announcement: { id: string; title: string; status: string; rejectionReason: string | null; author: { name: string } }
  }[]
}

export function ApprovalCenter({ announcements, prokers, events, logs }: ApprovalCenterProps) {
  return (
    <Tabs defaultValue="announcements">
      <TabsList>
        <TabsTrigger value="announcements">Pengumuman ({announcements.length})</TabsTrigger>
        <TabsTrigger value="prokers">Proker ({prokers.length})</TabsTrigger>
        <TabsTrigger value="events">Event ({events.length})</TabsTrigger>
        <TabsTrigger value="logs">Log</TabsTrigger>
      </TabsList>

      <TabsContent value="announcements">
        {announcements.length === 0 ? (
          <EmptyState title="Tidak ada pengumuman menunggu approval" />
        ) : (
          <ApprovalList initial={announcements} />
        )}
      </TabsContent>

      <TabsContent value="prokers">
        {prokers.length === 0 ? (
          <EmptyState title="Tidak ada proker menunggu approval" />
        ) : (
          <div className="space-y-3">
            {prokers.map((p) => (
              <ProkerRow key={p.id} proker={p} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="events">
        {events.length === 0 ? (
          <EmptyState title="Tidak ada event menunggu approval" />
        ) : (
          <div className="space-y-3">
            {events.map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="logs">
        {logs.length === 0 ? (
          <EmptyState title="Belum ada aktivitas approval" />
        ) : (
          <div className="space-y-2">
            {logs.map((l) => (
              <div key={l.id} className="rounded-lg border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground">{l.actor.name}</span>{' '}
                    {l.action === 'APPROVE' ? (
                      <Badge variant="success">menyetujui</Badge>
                    ) : (
                      <Badge variant="destructive">menolak</Badge>
                    )}{' '}
                    «{l.announcement.title}»
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(l.createdAt)}
                  </span>
                </div>
                {l.note && <p className="mt-1 text-xs text-muted-foreground">{l.note}</p>}
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function ProkerRow({ proker }: { proker: ProkerData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  async function decide(action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && !note.trim()) {
      toast({ title: 'Alasan wajib diisi', variant: 'destructive' })
      return
    }
    setLoading(true)
    const res = await fetch(`/api/prokers/${proker.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note: note || null }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: action === 'APPROVE' ? 'Proker disetujui' : 'Proker ditolak', variant: 'success' })
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal memproses', description: data?.error, variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{proker.name}</p>
            <Badge variant="secondary">{proker.division.name}</Badge>
            {proker.estimateBudget && (
              <Badge variant="outline">
                Rp {Number(proker.estimateBudget).toLocaleString('id-ID')}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengaju: {proker.proposedBy.name} ({proker.proposedBy.role}) ·{' '}
            {formatDateTime(proker.createdAt)}
          </p>
          {proker.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{proker.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan"
            className="w-40"
          />
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={() => decide('REJECT')}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Tolak
          </Button>
          <Button size="sm" disabled={loading} onClick={() => decide('APPROVE')}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Setujui
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EventRow({ event }: { event: EventData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  async function decide(action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && !note.trim()) {
      toast({ title: 'Alasan wajib diisi', variant: 'destructive' })
      return
    }
    setLoading(true)
    const res = await fetch(`/api/events/${event.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note: note || null }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: action === 'APPROVE' ? 'Event disetujui' : 'Event ditolak', variant: 'success' })
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal memproses', description: data?.error, variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{event.name}</p>
            <Badge variant="info">{EVENT_VISIBILITY_LABELS[event.visibility]}</Badge>
            {event.division && <Badge variant="secondary">{event.division.name}</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(event.startTime)} · {event.location ?? '—'} · oleh{' '}
            {event.createdBy.name}
          </p>
          {event.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan"
            className="w-40"
          />
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={() => decide('REJECT')}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Tolak
          </Button>
          <Button size="sm" disabled={loading} onClick={() => decide('APPROVE')}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Setujui
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
