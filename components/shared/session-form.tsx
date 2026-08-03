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

type SessionFormProps = {
  divisions: DivisionOption[]
  userDivisionId: string | null
  isBPH: boolean
}

export function SessionForm({ divisions, userDivisionId, isBPH }: SessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [divisionId, setDivisionId] = useState(isBPH ? '' : (userDivisionId ?? ''))
  const [endTime, setEndTime] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/attendance/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || null,
        divisionId: !divisionId || divisionId === '__general__' ? null : divisionId,
        endTime: endTime ? new Date(endTime).toISOString() : null,
      }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Gagal membuat sesi', description: data?.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return
    }

    toast({ title: 'Sesi absensi dibuat', description: 'Anda bisa langsung generate QR untuk sesi ini.', variant: 'success' })
    setTitle('')
    setDescription('')
    setEndTime('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="session-title">Judul Sesi</Label>
        <Input
          id="session-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="misal: Rapat Mingguan RION #4"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="session-desc">Deskripsi</Label>
        <Textarea
          id="session-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Catatan singkat sesi (opsional)"
          rows={2}
        />
      </div>

      {isBPH && (
        <div className="space-y-2">
          <Label>Divisi</Label>
          <Select value={divisionId} onValueChange={setDivisionId}>
            <SelectTrigger>
              <SelectValue placeholder="General / lintas divisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__general__">General / lintas divisi</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="session-end">Waktu Berakhir (opsional)</Label>
        <Input
          id="session-end"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Buat Sesi & QR
      </Button>
    </form>
  )
}
