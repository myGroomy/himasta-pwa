'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Loader2, MapPin, QrCode, ScanLine, Ticket } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

type EventLandingCardProps = {
  event: {
    id: string
    name: string
    startTime: string
    location: string | null
    visibility: 'INTERNAL' | 'PUBLIC'
    capacity: number | null
    _count: { registrations: number }
  }
  user: { id: string; role: string } | null
  registered: boolean
  qrToken: string | null
}

export function EventLandingCard({ event, user, registered, qrToken }: EventLandingCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [qrName, setQrName] = useState('')

  const isManager = user?.role === 'BPH' || user?.role === 'KADIV'
  const isFull = event.capacity ? event._count.registrations >= event.capacity : false

  async function register() {
    if (!user) {
      router.push(`/events/${event.id}`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}/register`, { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Gagal mendaftar')
      toast({ title: 'Terdaftar di event!', variant: 'success' })
      showQr(data.qrToken, data.name)
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Gagal daftar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function showQr(token: string, name: string) {
    setQrName(name)
    setQrImageUrl(null)
    import('qrcode')
      .then((mod) => mod.toDataURL(token))
      .then((url) => setQrImageUrl(url))
      .catch(() => {})
  }

  const start = new Date(event.startTime)

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-background hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
        <div className="relative h-40 w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
          <Calendar className="h-12 w-12 text-primary/40" />
          <div className="absolute top-4 left-4">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-background/90 backdrop-blur-sm border shadow-sm">
              {event.visibility === 'PUBLIC' ? 'Umum' : 'Internal'}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
              {event.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5">
          <div className="space-y-2 text-sm text-muted-foreground mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{format(start, 'dd MMMM yyyy', { locale: localeId })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{format(start, 'HH:mm')} - Selesai</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-border">
            {user ? (
              registered ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => showQr(qrToken ?? '', event.name)}
                >
                  <QrCode className="h-4 w-4" /> QR Saya
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={register}
                  disabled={loading || isFull}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                  {isFull ? 'Kuota Penuh' : 'Daftar'}
                </Button>
              )
            ) : (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/events/${event.id}`}>
                  <Ticket className="h-4 w-4" /> Daftar
                </Link>
              </Button>
            )}

            {isManager && (
              <Button asChild size="sm" variant="outline">
                <Link href="/events/scan">
                  <ScanLine className="h-4 w-4" /> Scan
                </Link>
              </Button>
            )}

            <Button asChild size="sm" variant="ghost" className="ml-auto">
              <Link href={`/events/${event.id}`}>Detail</Link>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={!!qrImageUrl} onOpenChange={(o) => !o && setQrImageUrl(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="pr-6">QR Absensi Event</DialogTitle>
            <DialogDescription className="line-clamp-2">{qrName}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrImageUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="QR Event"
                  className="h-64 w-64 rounded-xl border bg-white p-3"
                />
                <p className="text-center text-xs text-muted-foreground">
                  Tunjukkan QR ini di hari-H untuk absensi. Panitia memindai lewat menu Kelola Peserta
                  atau tombol Scan.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
