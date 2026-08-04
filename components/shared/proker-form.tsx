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
type UserOption = { id: string; name: string; role?: string; divisionId: string | null }

type ProkerFormProps = {
  user: { id: string; role: string; divisionId: string | null }
  divisions: DivisionOption[]
  users: UserOption[]
}

export function ProkerForm({ user, divisions, users }: ProkerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [divisionId, setDivisionId] = useState(user.divisionId ?? '')
  const [pjId, setPjId] = useState('')
  const [estimateBudget, setEstimateBudget] = useState('')
  const [timeline, setTimeline] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!divisionId) {
      toast({ title: 'Divisi wajib diisi', variant: 'destructive' })
      return
    }
    setLoading(true)

    const res = await fetch('/api/prokers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || null,
        divisionId,
        pjId: pjId || null,
        estimateBudget: estimateBudget ? Number(estimateBudget) : null,
        timeline: timeline || null,
      }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Gagal mengajukan proker', description: data?.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return
    }

    toast({ title: 'Proker diajukan', description: 'Menunggu persetujuan BPH.', variant: 'success' })
    router.push('/proker')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="proker-name">Nama Proker</Label>
        <Input
          id="proker-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="misal: Seminar Data Science 2026"
          required
          minLength={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proker-desc">Deskripsi</Label>
        <Textarea
          id="proker-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tujuan, sasaran, gambaran kegiatan (opsional)"
          rows={4}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Divisi</Label>
          <Select value={divisionId} onValueChange={setDivisionId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih divisi" />
            </SelectTrigger>
            <SelectContent>
              {user.role === 'BPH'
                ? divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))
                : divisions
                    .filter((d) => d.id === user.divisionId)
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>PJ (Penanggung Jawab)</Label>
          <Select value={pjId} onValueChange={setPjId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih PJ (opsional)" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((u) => !divisionId || u.divisionId === divisionId || u.role === 'BPH')
                .map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="proker-budget">Estimasi Anggaran (Rp)</Label>
          <Input
            id="proker-budget"
            type="number"
            min={0}
            value={estimateBudget}
            onChange={(e) => setEstimateBudget(e.target.value)}
            placeholder="misal: 500000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proker-timeline">Timeline</Label>
          <Input
            id="proker-timeline"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="misal: Mar–Mei 2026"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Ajukan Proker
      </Button>
    </form>
  )
}
