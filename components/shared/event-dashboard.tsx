'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Loader2,
  MapPin,
  QrCode,
  Ticket,
  Users,
  X,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDateTime } from '@/lib/utils'
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_BADGE,
  EVENT_VISIBILITY_LABELS,
} from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'
import { CertificateModal } from '@/components/events/CertificateModal'
import { EventSurveyDialog } from '@/components/events/EventSurveyDialog'

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
  division: { id: string; name: string; slug: string } | null
  createdBy: { id: string; name: string }
  approvedBy: { id: string; name: string } | null
  _count: { registrations: number }
  isUpcoming: boolean
}

type MyQr = { qrToken: string; attended: boolean }

type EventDashboardProps = {
  user: { id: string; role: string; divisionId: string | null }
  events: EventData[]
  myEventIds: string[]
  myQrByEvent: Record<string, MyQr>
}

export function EventDashboard({ user, events, myEventIds, myQrByEvent }: EventDashboardProps) {
  const router = useRouter()
  const isBPH = user.role === 'BPH'
  const isKadiv = user.role === 'KADIV'
  const canManage = isBPH || isKadiv
  const [registering, setRegistering] = useState<string | null>(null)
  const [qrEvent, setQrEvent] = useState<{ id: string; name: string; token: string } | null>(null)
  const [externalEvent, setExternalEvent] = useState<EventData | null>(null)
  const [certData, setCertData] = useState<any>(null)
  const [loadingCert, setLoadingCert] = useState<string | null>(null)

  const visibleEvents = events.filter((e) => e.status === 'PUBLISHED')
  const upcoming = visibleEvents.filter((e) => e.isUpcoming)
  const past = visibleEvents.filter((e) => !e.isUpcoming)
  const ownPending = events.filter((e) => e.status === 'PENDING_APPROVAL')
  const ownDraft = events.filter((e) => e.status === 'DRAFT' || e.status === 'REJECTED')

  async function downloadCertificate(eventId: string) {
    setLoadingCert(eventId)
    const res = await fetch(`/api/events/${eventId}/certificate`)
    const data = await res.json().catch(() => null)
    setLoadingCert(null)

    if (res.ok && data?.certificate) {
      setCertData(data.certificate)
    } else {
      toast({
        title: 'Sertifikat tidak dapat diunduh',
        description: data?.error ?? 'Pastikan Anda terdaftar dan telah menghadiri event.',
        variant: 'destructive',
      })
    }
  }

  async function register(eventId: string) {
    setRegistering(eventId)
    const res = await fetch(`/api/events/${eventId}/register`, { method: 'POST' })
    const data = await res.json().catch(() => null)
    setRegistering(null)
    if (res.ok) {
      toast({ title: 'Terdaftar di event!', variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Gagal daftar', description: data?.error, variant: 'destructive' })
    }
  }

  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">Akan Datang</TabsTrigger>
        <TabsTrigger value="past">Riwayat</TabsTrigger>
        {canManage && (
          <>
            <TabsTrigger value="manage">
              Kelola{ownPending.length > 0 ? ` (${ownPending.length})` : ''}
            </TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="upcoming" className="space-y-4">
        {upcoming.length === 0 ? (
          <EmptyState title="Belum ada event mendatang" />
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                isRegistered={myEventIds.includes(e.id)}
                myQr={myQrByEvent[e.id]}
                registering={registering === e.id}
                onRegister={() => register(e.id)}
                onShowQr={(token) => setQrEvent({ id: e.id, name: e.name, token })}
                onExternal={() => setExternalEvent(e)}
                canManage={canManage && (isBPH || e.division?.id === user.divisionId)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {past.length === 0 ? (
          <EmptyState title="Belum ada riwayat event" />
        ) : (
          <div className="space-y-3">
            {past.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                isRegistered={myEventIds.includes(e.id)}
                myQr={myQrByEvent[e.id]}
                registering={false}
                onRegister={() => { }}
                onShowQr={() => { }}
                onExternal={() => { }}
                canManage={canManage && (isBPH || e.division?.id === user.divisionId)}
                onDownloadCert={() => downloadCertificate(e.id)}
                loadingCert={loadingCert === e.id}
              />
            ))}
          </div>
        )}
      </TabsContent>

      {canManage && (
        <TabsContent value="manage" className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold">Menunggu Approval</h2>
            {ownPending.length === 0 ? (
              <EmptyState title="Tidak ada event menunggu approval" />
            ) : (
              <div className="space-y-3">
                {ownPending.map((e) => (
                  <ManagedEventRow key={e.id} event={e} />
                ))}
              </div>
            )}
          </div>
          {ownDraft.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">Draf / Ditolak</h2>
              <div className="space-y-3">
                {ownDraft.map((e) => (
                  <ManagedEventRow key={e.id} event={e} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      )}

      <QrDialog
        name={qrEvent?.name ?? ''}
        token={qrEvent?.token ?? ''}
        open={!!qrEvent}
        onOpenChange={(o) => !o && setQrEvent(null)}
      />

      <ExternalRegisterDialog
        event={externalEvent}
        onOpenChange={(o) => !o && setExternalEvent(null)}
        onDone={() => {
          setExternalEvent(null)
          router.refresh()
        }}
      />

      <CertificateModal
        isOpen={!!certData}
        onClose={() => setCertData(null)}
        data={certData}
      />
    </Tabs>
  )
}

function EventCard({
  event: e,
  isRegistered,
  myQr,
  registering,
  onRegister,
  onShowQr,
  onExternal,
  canManage,
  onDownloadCert,
  loadingCert,
}: {
  event: EventData
  isRegistered: boolean
  myQr?: MyQr
  registering: boolean
  onRegister: () => void
  onShowQr: (token: string) => void
  onExternal: () => void
  canManage: boolean
  onDownloadCert?: () => void
  loadingCert?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{e.name}</p>
            <Badge variant={e.visibility === 'PUBLIC' ? 'info' : 'secondary'}>
              {EVENT_VISIBILITY_LABELS[e.visibility]}
            </Badge>
            <Badge variant={e.isUpcoming ? 'success' : 'outline'}>
              {e.isUpcoming ? 'Akan datang' : 'Selesai'}
            </Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateTime(e.startTime)}
            </span>
            {e.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {e.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {e._count.registrations}
              {e.capacity ? `/${e.capacity}` : ''}
            </span>
            <span>{e.division?.name ?? 'General'}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {e.status === 'PUBLISHED' && e.isUpcoming && (
            <>
              {isRegistered && myQr ? (
                <Button variant="outline" size="sm" onClick={() => onShowQr(myQr.qrToken)}>
                  <QrCode className="h-4 w-4" /> QR Saya
                </Button>
              ) : (
                <Button size="sm" onClick={onRegister} disabled={registering}>
                  {registering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ticket className="h-4 w-4" />
                  )}
                  Daftar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onExternal}>
                Daftar Eksternal
              </Button>
            </>
          )}

          {/* Tombol Unduh Sertifikat & Survey untuk Event yang Selesai */}
          {!e.isUpcoming && (
            <>
              <EventSurveyDialog eventId={e.id} eventName={e.name} />
              {isRegistered && myQr?.attended && onDownloadCert && (
                <Button size="sm" variant="default" className="bg-sky-600 hover:bg-sky-500" onClick={onDownloadCert} disabled={loadingCert}>
                  {loadingCert ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  Sertifikat
                </Button>
              )}
            </>
          )}

          {canManage && e.status === 'PUBLISHED' && (
            <ManageRegistrationsButton event={e} />
          )}
        </div>
      </CardContent>
      {e.description && (
        <CardContent className="border-t pt-4 text-sm text-muted-foreground">
          {e.description}
        </CardContent>
      )}
    </Card>
  )
}

function ManagedEventRow({ event: e }: { event: EventData }) {
  const router = useRouter()
  const [deciding, setDeciding] = useState<string | null>(null)
  const [note, setNote] = useState('')

  async function decide(action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && !note.trim()) {
      toast({ title: 'Alasan wajib diisi', variant: 'destructive' })
      return
    }
    setDeciding(action)
    const res = await fetch(`/api/events/${e.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note: note || null }),
    })
    setDeciding(null)
    if (res.ok) {
      toast({ title: action === 'APPROVE' ? 'Event disetujui' : 'Event ditolak', variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Gagal memproses', variant: 'destructive' })
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{e.name}</p>
            <Badge className={EVENT_STATUS_BADGE[e.status]}>
              {EVENT_STATUS_LABELS[e.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {e.division?.name ?? 'General'} · {e.createdBy.name} ·{' '}
            {EVENT_VISIBILITY_LABELS[e.visibility]}
          </p>
        </div>
        {e.status === 'PENDING_APPROVAL' && (
          <div className="flex shrink-0 items-center gap-2">
            <Input
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              placeholder="Catatan"
              className="w-40"
            />
            <Button
              variant="destructive"
              size="sm"
              disabled={deciding !== null}
              onClick={() => decide('REJECT')}
            >
              {deciding === 'REJECT' && <Loader2 className="h-4 w-4 animate-spin" />}
              Tolak
            </Button>
            <Button size="sm" disabled={deciding !== null} onClick={() => decide('APPROVE')}>
              {deciding === 'APPROVE' && <Loader2 className="h-4 w-4 animate-spin" />}
              Setujui
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ManageRegistrationsButton({ event }: { event: EventData }) {
  const [open, setOpen] = useState(false)
  const [registrations, setRegistrations] = useState<
    { id: string; name: string; email: string | null; attended: boolean; qrToken: string | null }[]
  >([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/events/${event.id}/registrations`)
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (data?.registrations) setRegistrations(data.registrations)
      })
      .finally(() => setLoading(false))
  }, [open, event.id])

  async function toggle(id: string, attended: boolean) {
    const res = await fetch(`/api/events/${event.id}/registrations`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationId: id, attended }),
    })
    if (res.ok) {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, attended } : r))
      )
      router.refresh()
    } else {
      toast({ title: 'Gagal update kehadiran', variant: 'destructive' })
    }
  }

  const attendedCount = registrations.filter((r) => r.attended).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Users className="h-4 w-4" /> Peserta ({event._count.registrations})
      </Button>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Peserta {event.name}</DialogTitle>
          <DialogDescription>
            {attendedCount}/{registrations.length} hadir. Tandai kehadiran untuk sertifikat.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : registrations.length === 0 ? (
          <EmptyState title="Belum ada peserta" />
        ) : (
          <div className="max-h-96 divide-y overflow-y-auto rounded-lg border">
            {registrations.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.email ?? 'Eksternal'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={r.attended ? 'default' : 'outline'}
                  onClick={() => toggle(r.id, !r.attended)}
                >
                  {r.attended ? 'Hadir ✓' : 'Tandai Hadir'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function QrDialog({
  name,
  token,
  open,
  onOpenChange,
}: {
  name: string
  token: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !token) return
    setLoading(true)
    setQrDataUrl(null)
    // dynamic import utk menghindari SSR qrcode (node-only)
    import('qrcode')
      .then((mod) => mod.toDataURL(token))
      .then((url) => setQrDataUrl(url))
      .catch(() => { })
      .finally(() => setLoading(false))
  }, [open, token])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="pr-6">QR Absensi Event</DialogTitle>
          <DialogDescription className="line-clamp-2">{name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {loading && <Loader2 className="h-6 w-6 animate-spin" />}
          {qrDataUrl && !loading && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="QR Event"
                className="h-64 w-64 rounded-xl border bg-white p-3"
              />
              <p className="text-center text-xs text-muted-foreground">
                Tunjukkan QR ini di hari-H untuk absensi. Panitia memindai lewat menu Kelola Peserta.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ExternalRegisterDialog({
  event,
  onOpenChange,
  onDone,
}: {
  event: EventData | null
  onOpenChange: (o: boolean) => void
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ message: string; token?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return
    setLoading(true)
    const res = await fetch('/api/events/register-external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event.id, name, email, phone: phone || null }),
    })
    const data = await res.json().catch(() => null)
    setLoading(false)
    if (res.ok) {
      setResult({ message: data?.message ?? 'Pendaftaran berhasil.', token: data?.registration?.qrToken })
    } else {
      setResult({ message: data?.error ?? 'Gagal mendaftar' })
    }
  }

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Daftar Eksternal</DialogTitle>
          <DialogDescription>
            {event ? `Pendaftaran ${event.name} tanpa akun HIMASTA.` : ''}
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <div className="space-y-3">
            <p className="text-sm">{result.message}</p>
            {result.token && (
              <p className="rounded-lg bg-muted p-3 text-xs font-mono break-all">{result.token}</p>
            )}
            <Button onClick={() => onDone()} className="w-full">
              Selesai
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ext-name">Nama Lengkap</Label>
              <Input id="ext-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ext-email">Email</Label>
              <Input
                id="ext-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ext-phone">No. HP (opsional)</Label>
              <Input id="ext-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Daftar
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
