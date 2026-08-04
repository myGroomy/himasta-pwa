'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type DivisionOption = { id: string; name: string; slug: string }

type EventFormProps = {
  user: { id: string; role: string; divisionId: string | null }
  divisions: DivisionOption[]
}

export function EventForm({ user, divisions }: EventFormProps) {
  const router = useRouter()
  const isBPH = user.role === 'BPH'
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('')
  const [visibility, setVisibility] = useState<'INTERNAL' | 'PUBLIC'>('INTERNAL')
  const [divisionId, setDivisionId] = useState(user.divisionId ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startTime) {
      toast({ title: 'Waktu mulai wajib diisi', variant: 'destructive' })
      return
    }
    setLoading(true)

    const targetDivision = divisionId && divisionId !== '__general__' ? divisionId : null
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || null,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : null,
        location: location || null,
        capacity: capacity ? Number(capacity) : null,
        visibility,
        divisionId: targetDivision,
      }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Gagal membuat event', description: data?.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return
    }

    const needsApproval = data?.event?.status === 'PENDING_APPROVAL'
    toast({
      title: 'Event dibuat',
      description: needsApproval ? 'Menunggu persetujuan BPH untuk tayang publik.' : 'Event tayang.',
      variant: 'success',
    })
    router.push('/events')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="event-name">Nama Event</Label>
        <Input
          id="event-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="misal: Seminar Data Science 2026"
          required
          minLength={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-desc">Deskripsi</Label>
        <Textarea
          id="event-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pembicara, agenda, target peserta (opsional)"
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-start">Waktu Mulai</Label>
          <Input
            id="event-start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-end">Waktu Selesai (opsional)</Label>
          <Input
            id="event-end"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="event-loc">Lokasi</Label>
          <Input
            id="event-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="misal: Aula Gedung B"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-cap">Kapasitas (opsional)</Label>
          <Input
            id="event-cap"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="misal: 100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Visibilitas</Label>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as 'INTERNAL' | 'PUBLIC')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERNAL">Internal (divisi)</SelectItem>
              <SelectItem value="PUBLIC">Publik (semua)</SelectItem>
            </SelectContent>
          </Select>
          {!isBPH && visibility === 'PUBLIC' && (
            <p className="text-xs text-amber-600">
              Event publik divisi menunggu persetujuan BPH sebelum tayang.
            </p>
          )}
        </div>

        {isBPH && (
          <div className="space-y-2">
            <Label>Divisi</Label>
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger>
                <SelectValue placeholder="General / tanpa divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__general__">General</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Buat Event
      </Button>
    </form>
  )
}
