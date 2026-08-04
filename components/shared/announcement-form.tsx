'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/shared/rich-text-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import type { AnnouncementScope } from '@prisma/client'

type DivisionOption = { id: string; name: string; slug: string }

type AnnouncementFormProps = {
  divisions: DivisionOption[]
  defaultScope?: AnnouncementScope
  allowGeneral: boolean
  isBPH: boolean
  presetDivisionId?: string
  initialData?: {
    id: string
    title: string
    content: string
    scope: AnnouncementScope
    divisionId: string | null
    category: string
    visibleToDosen: boolean
  }
}

const CATEGORIES = [
  { value: 'organisasi', label: 'Organisasi' },
  { value: 'event', label: 'Event' },
  { value: 'beasiswa', label: 'Beasiswa' },
  { value: 'akademik', label: 'Akademik' },
]

export function AnnouncementForm({ divisions, defaultScope = 'DIVISION', allowGeneral, isBPH, presetDivisionId, initialData }: AnnouncementFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [scope, setScope] = useState<AnnouncementScope>(initialData?.scope ?? defaultScope)
  const [divisionId, setDivisionId] = useState(initialData?.divisionId ?? presetDivisionId ?? divisions[0]?.id ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'organisasi')
  const [visibleToDosen, setVisibleToDosen] = useState(initialData?.visibleToDosen ?? false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const url = initialData ? `/api/announcements/${initialData.id}` : '/api/announcements'
    const method = initialData ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        scope,
        divisionId: scope === 'DIVISION' ? divisionId : null,
        category,
        visibleToDosen,
      }),
    })

    const data = await res.json().catch(() => null)

    setLoading(false)

    if (!res.ok) {
      toast({ title: initialData ? 'Gagal mengedit pengumuman' : 'Gagal membuat pengumuman', description: data?.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return
    }

    toast({
      title: initialData ? 'Pengumuman diperbarui' : 'Pengumuman dibuat',
      description: initialData ? 'Perubahan berhasil disimpan.' : scope === 'GENERAL' && !isBPH ? 'Menunggu approval BPH untuk tayang.' : 'Pengumuman berhasil dipublikasikan.',
      variant: 'success',
    })
    
    if (initialData) {
      router.push(`/announcements/${initialData.id}`)
    } else {
      router.push('/announcements')
    }
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul pengumuman"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Scope</Label>
        <Select
          value={scope}
          onValueChange={(v) => setScope(v as AnnouncementScope)}
          disabled={!allowGeneral}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih scope" />
          </SelectTrigger>
          <SelectContent>
            {allowGeneral && <SelectItem value="GENERAL">General (semua anggota)</SelectItem>}
            <SelectItem value="DIVISION">Divisi (workspace divisi)</SelectItem>
          </SelectContent>
        </Select>
        {!allowGeneral && (
          <p className="text-xs text-muted-foreground">Postingan ini akan tampil di workspace divisi Anda.</p>
        )}
      </div>

      {scope === 'DIVISION' && (
        <div className="space-y-2">
          <Label>Divisi</Label>
          <Select value={divisionId} onValueChange={setDivisionId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih divisi" />
            </SelectTrigger>
            <SelectContent>
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
        <Label>Kategori</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Konten</Label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={visibleToDosen}
          onChange={(e) => setVisibleToDosen(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        Tampilkan juga untuk dosen (read-only)
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {scope === 'GENERAL' && !isBPH ? 'Kirim untuk Approval' : 'Publikasikan'}
        </Button>
      </div>
    </form>
  )
}
