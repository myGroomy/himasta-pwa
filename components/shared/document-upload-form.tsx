'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Upload } from 'lucide-react'
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
import type { DocumentCategory } from '@prisma/client'

type DivisionOption = { id: string; name: string; slug: string }

type DocumentUploadFormProps = {
  divisions: DivisionOption[]
  userDivisionId: string | null
  isBPH: boolean
}

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'NOTULEN', label: 'Notulen' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'LPJ', label: 'LPJ' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
]

export function DocumentUploadForm({ divisions, userDivisionId, isBPH }: DocumentUploadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('NOTULEN')
  const [divisionId, setDivisionId] = useState(isBPH ? '' : (userDivisionId ?? ''))
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  function onFileChange(next: File | null) {
    setFile(next)
    setFileError(null)
    if (!next) return
    if (!ALLOWED_TYPES.includes(next.type)) {
      setFileError(
        'Tipe file tidak diizinkan. Gunakan PDF, Word (.doc/.docx), Excel (.xls/.xlsx), atau gambar (PNG/JPG/WEBP).'
      )
    } else if (next.size > MAX_SIZE) {
      setFileError(
        `Ukuran file ${(next.size / 1024 / 1024).toFixed(1)} MB melebihi batas 10 MB. Kompres atau bagi file sebelum upload.`
      )
    }
  }

  function uploadWithProgress(form: FormData): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/documents')
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        let data: { error?: string } | null = null
        try {
          data = JSON.parse(xhr.responseText)
        } catch {
          data = null
        }
        resolve({ ok: xhr.status >= 200 && xhr.status < 300, error: data?.error })
      }
      xhr.onerror = () => resolve({ ok: false, error: 'Koneksi terputus saat upload. Periksa jaringan dan coba lagi.' })
      xhr.ontimeout = () => resolve({ ok: false, error: 'Upload melebihi batas waktu. Coba lagi.' })
      xhr.timeout = 60_000
      xhr.send(form)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast({ title: 'File wajib diisi', variant: 'destructive' })
      return
    }
    if (fileError) {
      toast({ title: fileError, variant: 'destructive' })
      return
    }
    setLoading(true)
    setProgress(0)

    const form = new FormData()
    form.append('title', title)
    form.append('description', description)
    form.append('category', category)
    form.append('divisionId', divisionId || '__general__')
    form.append('file', file)

    const result = await uploadWithProgress(form)
    setLoading(false)

    if (!result.ok) {
      toast({ title: 'Gagal upload', description: result.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return
    }

    toast({ title: 'Dokumen tersimpan', variant: 'success' })
    setTitle('')
    setDescription('')
    setFile(null)
    setProgress(0)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="doc-title">Judul Dokumen</Label>
        <Input
          id="doc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="misal: Notulen Rapat PSDM #3"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
            <SelectTrigger>
              <SelectValue />
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

        {isBPH && (
          <div className="space-y-2">
            <Label>Divisi</Label>
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger>
                <SelectValue placeholder="General" />
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

      <div className="space-y-2">
        <Label htmlFor="doc-desc">Deskripsi</Label>
        <Textarea
          id="doc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deskripsi singkat (opsional)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="doc-file">File (maks 10 MB PDF, Word, Excel, atau gambar)</Label>
        <Input
          id="doc-file"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/webp"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          required
        />
        {file && !fileError && (
          <p className="text-xs text-muted-foreground">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
        {fileError && (
          <p className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {fileError}
          </p>
        )}
      </div>

      {loading && (
        <div className="space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}

      <Button type="submit" disabled={loading || !!fileError}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? `Uploading ${progress}%...` : 'Upload Dokumen'}
      </Button>
    </form>
  )
}
