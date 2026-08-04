'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck, CheckSquare, Hourglass, Loader2, Plus, Search, UserRoundCog, X, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { ROLE_LABELS } from '@/lib/constants'
import Papa from 'papaparse'

type ManagedUser = {
  id: string
  nim: string | null
  email: string
  name: string
  role: string
  phone: string | null
  isActive: boolean
  pendingApproval: boolean
  division: { id: string; name: string; slug: string } | null
}

type DivisionOption = { id: string; name: string; slug: string }

type UserManagerProps = {
  initialUsers: ManagedUser[]
  divisions: DivisionOption[]
}

export function UserManager({ initialUsers, divisions }: UserManagerProps) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [divisionFilter, setDivisionFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkTarget, setBulkTarget] = useState<{ divisionId: string | null } | { role: string } | { isActive: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportCSV = () => {
    window.open('/api/users/export', '_blank')
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedUsers = results.data
        if (parsedUsers.length === 0) {
          toast({ title: 'File CSV kosong', variant: 'destructive' })
          return
        }

        setBulkBusy(true)
        try {
          const res = await fetch('/api/users/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: parsedUsers })
          })
          
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          
          toast({ title: 'Import Selesai', description: data.message, variant: 'success' })
          router.refresh()
        } catch (err: any) {
          toast({ title: 'Gagal Import CSV', description: err.message, variant: 'destructive' })
        } finally {
          setBulkBusy(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      },
      error: (error) => {
        toast({ title: 'Gagal membaca CSV', description: error.message, variant: 'destructive' })
      }
    })
  }

  const matchUser = (u: ManagedUser) =>
    !q ||
    u.name.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase()) ||
    (u.nim ?? '').toLowerCase().includes(q.toLowerCase())

  const pendingUsers = users.filter((u) => !u.isActive && u.pendingApproval)
  const filteredPending = pendingUsers.filter(matchUser)

  const memberUsers = users.filter((u) => !u.pendingApproval)

  const matchesFilters = (u: ManagedUser) => {
    const matchQ = matchUser(u)
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchDivision =
      divisionFilter === 'ALL' ||
      (divisionFilter === 'NONE' ? !u.division : u.division?.id === divisionFilter)

    return matchQ && matchRole && matchDivision
  }

  const filteredActive = memberUsers.filter((u) => u.isActive && matchesFilters(u))
  const filteredInactive = memberUsers.filter((u) => !u.isActive && matchesFilters(u))
  const showPending = statusFilter === 'ALL' || statusFilter === 'PENDING'
  const showActive = statusFilter === 'ALL' || statusFilter === 'AKTIF'
  const showInactive = statusFilter === 'ALL' || statusFilter === 'NONAKTIF'

  const isEmpty =
    (showPending ? filteredPending.length : 0) +
      (showActive ? filteredActive.length : 0) +
      (showInactive ? filteredInactive.length : 0) ===
    0

  async function deleteUser(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini secara permanen? Tindakan ini tidak bisa dibatalkan.')) return

    setBusyId(id)
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setBusyId(null)
    
    if (!res.ok) {
      toast({ title: 'Gagal menghapus user', variant: 'destructive' })
      return
    }
    
    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast({ title: 'User dihapus', variant: 'success' })
    router.refresh()
  }

  async function updateUser(id: string, data: Record<string, unknown>) {
    setBusyId(id)
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setBusyId(null)
    if (!res.ok) {
      toast({ title: 'Gagal memperbarui user', variant: 'destructive' })
      return
    }
    const json = await res.json()
    setUsers((prev) => prev.map((u) => (u.id === id ? json.user : u)))
    toast({ title: 'User diperbarui', variant: 'success' })
    router.refresh()
  }

  async function approveUser(id: string) {
    setBusyId(id)
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: true, role: 'ANGGOTA', divisionId: null, pendingApproval: false }),
    })
    setBusyId(null)
    if (!res.ok) {
      toast({ title: 'Gagal menyetujui akun', variant: 'destructive' })
      return
    }
    const json = await res.json()
    setUsers((prev) => prev.map((u) => (u.id === id ? json.user : u)))
    toast({ title: 'Akun disetujui', description: `${json.user.name} kini menjadi anggota aktif.`, variant: 'success' })
    router.refresh()
  }

  async function rejectUser(id: string) {
    if (!confirm('Tolak pendaftaran ini? Akun akan dihapus secara permanen.')) return

    setBusyId(id)
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    setBusyId(null)

    if (!res.ok) {
      toast({ title: 'Gagal menolak pendaftaran', variant: 'destructive' })
      return
    }

    setUsers((prev) => prev.filter((u) => u.id !== id))
    toast({ title: 'Pendaftaran ditolak', variant: 'success' })
    router.refresh()
  }

  function blockSelection(list: ManagedUser[]) {
    const all = list.length > 0 && list.every((u) => selected.has(u.id))
    const some = list.some((u) => selected.has(u.id)) && !all
    return { all, some }
  }

  function toggleBlock(list: ManagedUser[]) {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSel = list.length > 0 && list.every((u) => next.has(u.id))
      if (allSel) list.forEach((u) => next.delete(u.id))
      else list.forEach((u) => next.add(u.id))
      return next
    })
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bulkTargets = users.filter((u) => selected.has(u.id))

  const activeSel = blockSelection(filteredActive)
  const inactiveSel = blockSelection(filteredInactive)

  async function runBulk(update: Record<string, unknown>) {
    if (bulkTargets.length === 0) return
    setBulkBusy(true)
    const payload = 'isActive' in update ? { ...update, pendingApproval: false } : update
    const results = await Promise.all(
      bulkTargets
        .map((u) =>
          fetch(`/api/users/${u.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        )
    )
    setBulkBusy(false)
    const ok = results.filter((r) => r.ok).length
    const failed = results.length - ok
    setSelected(new Set())
    setBulkTarget(null)
    toast({
      title: failed > 0 ? `${ok} berhasil, ${failed} gagal` : `${ok} user diperbarui`,
      variant: failed > 0 ? 'default' : 'success',
    })
    router.refresh()
  }

  const renderMemberRow = (u: ManagedUser) => (
    <div
      key={u.id}
      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${u.isActive ? '' : 'bg-slate-500/[0.03]'}`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selected.has(u.id)}
          onChange={() => toggleOne(u.id)}
          disabled={busyId === u.id}
          aria-label={`Pilih ${u.name}`}
          className="h-4 w-4 rounded border-input"
        />
        <Avatar>
          <AvatarFallback>
            {u.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="flex items-center gap-2 font-medium">
            {u.name}
            {!u.isActive && <Badge variant="secondary">Nonaktif</Badge>}
          </p>
          <p className="text-sm text-muted-foreground">
            {u.email} · {u.nim ?? '—'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={u.role}
          onValueChange={(v) => updateUser(u.id, { role: v })}
          disabled={busyId === u.id}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={u.division?.id ?? '__none__'}
          onValueChange={(v) => updateUser(u.id, { divisionId: v === '__none__' ? null : v })}
          disabled={busyId === u.id || u.role === 'DOSEN'}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Divisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Tanpa divisi</SelectItem>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={u.isActive ? 'AKTIF' : 'NONAKTIF'}
          onValueChange={(v) => updateUser(u.id, { isActive: v === 'AKTIF', pendingApproval: false })}
          disabled={busyId === u.id}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AKTIF">Aktif</SelectItem>
            <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="w-9 px-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => deleteUser(u.id)}
          disabled={busyId === u.id}
          title="Hapus Pengguna"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIM, atau email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Semua peran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua peran</SelectItem>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
          <SelectTrigger className="sm:w-44">
            <SelectValue placeholder="Semua divisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua divisi</SelectItem>
            <SelectItem value="NONE">Tanpa divisi</SelectItem>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua status</SelectItem>
            <SelectItem value="PENDING">Menunggu Persetujuan</SelectItem>
            <SelectItem value="AKTIF">Aktif</SelectItem>
            <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleExportCSV} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
          />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} title="Import CSV" disabled={bulkBusy}>
            {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </Button>
          <AddUserDialog divisions={divisions} />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-primary/5 p-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{selected.size} user dipilih</span>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select
              value=""
              onValueChange={(v) => v && setBulkTarget({ divisionId: v === '__none__' ? null : v })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Assign divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Tanpa divisi</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value="" onValueChange={(v) => v && setBulkTarget({ role: v })}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Ubah peran" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => setBulkTarget({ isActive: false })}>
              Nonaktifkan
            </Button>
            <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => setBulkTarget({ isActive: true })}>
              Aktifkan
            </Button>            <Button variant="ghost" size="icon" onClick={() => setSelected(new Set())} aria-label="Bersihkan pilihan">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <BulkConfirmDialog
        open={!!bulkTarget}
        target={bulkTarget}
        count={bulkTargets.length}
        onClose={() => setBulkTarget(null)}
        onConfirm={() => bulkTarget && runBulk(bulkTarget)}
        busy={bulkBusy}
      />

      <Card>
        <CardContent className="divide-y p-0">
          {showPending && filteredPending.length > 0 && (
            <>
              <div className="flex items-center gap-2 border-b bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                <Hourglass className="h-4 w-4" />
                Menunggu Persetujuan ({filteredPending.length})
              </div>
              {filteredPending.map((u) => (
                <div key={u.id} className="flex flex-col gap-3 bg-amber-500/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {u.email} · {u.nim ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="warning">PENDING</Badge>
                    <Button size="sm" onClick={() => approveUser(u.id)} disabled={busyId === u.id}>
                      {busyId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                      Terima
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => rejectUser(u.id)}
                      disabled={busyId === u.id}
                    >
                      <X className="h-4 w-4" />
                      Tolak
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}

          {showActive && filteredActive.length > 0 && (
            <>
              <div className="flex items-center gap-3 border-b bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                <input
                  type="checkbox"
                  checked={activeSel.all}
                  ref={(el) => {
                    if (el) el.indeterminate = activeSel.some
                  }}
                  onChange={() => toggleBlock(filteredActive)}
                  aria-label="Pilih semua aktif"
                  className="h-4 w-4 rounded border-input"
                />
                <span>Aktif ({filteredActive.length})</span>
              </div>
              {filteredActive.map(renderMemberRow)}
            </>
          )}

          {showInactive && filteredInactive.length > 0 && (
            <>
              <div className="flex items-center gap-3 border-b bg-slate-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={inactiveSel.all}
                  ref={(el) => {
                    if (el) el.indeterminate = inactiveSel.some
                  }}
                  onChange={() => toggleBlock(filteredInactive)}
                  aria-label="Pilih semua nonaktif"
                  className="h-4 w-4 rounded border-input"
                />
                <span>Nonaktif ({filteredInactive.length})</span>
              </div>
              {filteredInactive.map(renderMemberRow)}
            </>
          )}

          {isEmpty && (
            <p className="p-6 text-center text-sm text-muted-foreground">Tidak ada user yang cocok.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BulkConfirmDialog({
  open,
  target,
  count,
  onClose,
  onConfirm,
  busy,
}: {
  open: boolean
  target: { divisionId: string | null } | { role: string } | { isActive: boolean } | null
  count: number
  onClose: () => void
  onConfirm: () => void
  busy: boolean
}) {
  function describe(): string {
    if (!target) return ''
    if ('divisionId' in target) {
      return target.divisionId ? 'assign divisi baru' : 'hapus divisi (tanpa divisi)'
    }
    if ('role' in target) return `ubah peran menjadi ${ROLE_LABELS[target.role as keyof typeof ROLE_LABELS]}`
    return target.isActive ? 'aktifkan' : 'nonaktifkan'
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Konfirmasi operasi massal</DialogTitle>
          <DialogDescription>
            {count} user terpilih akan {describe()}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Konfirmasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddUserDialog({ divisions }: { divisions: DivisionOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    nim: '',
    password: 'himasta123',
    role: 'ANGGOTA',
    divisionId: '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        nim: form.nim || null,
        divisionId: !form.divisionId || form.divisionId === '__none__' ? null : form.divisionId,
      }),
    })
    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Gagal membuat user', description: data?.error, variant: 'destructive' })
      return
    }

    toast({ title: 'User dibuat', description: `Password awal: ${form.password}`, variant: 'success' })
    setOpen(false)
    setForm({ name: '', email: '', nim: '', password: 'himasta123', role: 'ANGGOTA', divisionId: '' })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRoundCog className="h-5 w-5" />
            Tambah User
          </DialogTitle>
          <DialogDescription>
            Buat akun untuk anggota baru. Password awal: himasta123 (bisa diubah oleh user/BPH).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u-name">Nama Lengkap</Label>
            <Input id="u-name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-email">Email</Label>
            <Input id="u-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="u-nim">NIM (opsional)</Label>
              <Input id="u-nim" value={form.nim} onChange={(e) => set('nim', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-pw">Password Awal</Label>
              <Input id="u-pw" value={form.password} onChange={(e) => set('password', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Peran</Label>
              <Select value={form.role} onValueChange={(v) => set('role', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Divisi</Label>
              <Select value={form.divisionId} onValueChange={(v) => set('divisionId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Tanpa divisi</SelectItem>
                  {divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Buat User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
