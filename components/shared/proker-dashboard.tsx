'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ListTodo,
  Loader2,
  Plus,
  Target,
  X,
} from 'lucide-react'
import { EvaluasiProkerDialog } from '@/components/shared/evaluasi-proker-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'
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
import { formatDate } from '@/lib/utils'
import {
  PROKER_STATUS_LABELS,
  PROKER_STATUS_BADGE,
  TASK_STATUS_LABELS,
} from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'

type ProkerData = {
  id: string
  name: string
  description: string | null
  status: 'RENCANA' | 'BERJALAN' | 'SELESAI' | 'DIBATALKAN'
  timeline: string | null
  startDate: string | null
  endDate: string | null
  estimateBudget: string | null
  actualBudget: string | null
  division: { id: string; name: string; slug: string }
  proposedBy: { id: string; name: string }
  approvedBy: { id: string; name: string } | null
  pj: { id: string; name: string } | null
  tasks: { id: string; title: string; status: 'BELUM' | 'BERJALAN' | 'SELESAI' }[]
}

type UserOption = { id: string; name: string; role: string; divisionId: string | null }

type ProkerDashboardProps = {
  user: { id: string; role: string; divisionId: string | null }
  prokers: ProkerData[]
  users: UserOption[]
  isBPH: boolean
}

export function ProkerDashboard({ user, prokers, users, isBPH }: ProkerDashboardProps) {
  const router = useRouter()
  const canManage = user.role === 'BPH' || user.role === 'KADIV'
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA')

  const filtered = useMemo(
    () => (statusFilter === 'SEMUA' ? prokers : prokers.filter((p) => p.status === statusFilter)),
    [prokers, statusFilter]
  )

  const budgetTotal = prokers.reduce((sum, p) => sum + (Number(p.estimateBudget) || 0), 0)
  const budgetRealized = prokers.reduce((sum, p) => sum + (Number(p.actualBudget) || 0), 0)

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Tabs defaultValue="prokers">
      <TabsList>
        <TabsTrigger value="prokers">Daftar Proker</TabsTrigger>
        <TabsTrigger value="budget">Anggaran</TabsTrigger>
      </TabsList>

      <TabsContent value="prokers" className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {['SEMUA', 'RENCANA', 'BERJALAN', 'SELESAI', 'DIBATALKAN'].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'SEMUA' ? 'Semua' : PROKER_STATUS_LABELS[s as keyof typeof PROKER_STATUS_LABELS]}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Belum ada proker"
            description={canManage ? 'Ajukan proker untuk mulai mengelola program kerja divisi.' : 'Belum ada proker yang ditampilkan.'}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <ProkerCard
                key={p.id}
                proker={p}
                user={user}
                users={users}
                isBPH={isBPH}
                expanded={expanded.has(p.id)}
                onToggle={() => toggleExpand(p.id)}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="budget">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CircleDollarSign className="h-4 w-4" /> Estimasi Anggaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                Rp {budgetTotal.toLocaleString('id-ID')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Total estimasi seluruh proker ({prokers.length} proker)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" /> Realisasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                Rp {budgetRealized.toLocaleString('id-ID')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Catatan: ini estimasi kerja proker, bukan laporan keuangan HIMASTA.
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Anggaran ringan per proker pemakaian real diisi oleh kadiv. Laporan keuangan resmi di luar cakupan aplikasi.
        </p>
      </TabsContent>
    </Tabs>
  )
}

function ProkerCard({
  proker,
  user,
  users,
  isBPH,
  expanded,
  onToggle,
}: {
  proker: ProkerData
  user: { id: string; role: string; divisionId: string | null }
  users: UserOption[]
  isBPH: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const router = useRouter()
  const canManageProker =
    isBPH || (user.role === 'KADIV' && user.divisionId === proker.division.id)
  const doneCount = proker.tasks.filter((t) => t.status === 'SELESAI').length
  const progress = proker.tasks.length ? Math.round((doneCount / proker.tasks.length) * 100) : 0

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{proker.name}</p>
            <Badge className={PROKER_STATUS_BADGE[proker.status]}>
              {PROKER_STATUS_LABELS[proker.status]}
            </Badge>
            {proker.status === 'DIBATALKAN' && proker.description && (
              <span className="text-xs text-destructive">{proker.description}</span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{proker.division.name}</span>
            {proker.pj && <span>PJ: {proker.pj.name}</span>}
            <span>Pengaju: {proker.proposedBy.name}</span>
            {proker.startDate && <span>{formatDate(proker.startDate)}</span>}
            {proker.endDate && <span>→ {formatDate(proker.endDate)}</span>}
          </p>
          {proker.tasks.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {doneCount}/{proker.tasks.length} task · {progress}%
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {proker.status === 'SELESAI' && (
            <EvaluasiProkerDialog prokerId={proker.id} prokerName={proker.name} />
          )}
          {proker.status === 'RENCANA' && isBPH && (
            <ApproveDialog proker={proker} router={router} />
          )}
          {canManageProker && proker.status !== 'DIBATALKAN' && proker.status !== 'SELESAI' && (
            <UpdateStatusButton proker={proker} />
          )}
          <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Detail proker">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>

      {expanded && (
        <CardContent className="border-t pt-4">
          {proker.description && (
            <p className="mb-3 text-sm text-muted-foreground">{proker.description}</p>
          )}
          <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estimasi</p>
              <p>Rp {Number(proker.estimateBudget || 0).toLocaleString('id-ID')}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Realisasi</p>
              <p>Rp {Number(proker.actualBudget || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <TaskList
            prokerId={proker.id}
            tasks={proker.tasks as { id: string; title: string; status: string }[]}
            users={users}
            user={user}
            canManage={canManageProker}
          />
        </CardContent>
      )}
    </Card>
  )
}

function ApproveDialog({
  proker,
  router,
}: {
  proker: ProkerData
  router: ReturnType<typeof useRouter>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  async function decide(action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && !note.trim()) {
      toast({ title: 'Alasan wajib diisi', description: 'Isi alasan penolakan.', variant: 'destructive' })
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
      setOpen(false)
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal memproses', description: data?.error, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Approve</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approval Proker</DialogTitle>
          <DialogDescription>Setujui atau tolak pengajuan «{proker.name}».</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Alasan (wajib jika menolak)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan persetujuan / alasan penolakan"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              disabled={loading}
              onClick={() => decide('REJECT')}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <X className="h-4 w-4" /> Tolak
            </Button>
            <Button disabled={loading} onClick={() => decide('APPROVE')}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" /> Setujui
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UpdateStatusButton({ proker }: { proker: ProkerData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    const res = await fetch(`/api/prokers/${proker.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: `Status → ${PROKER_STATUS_LABELS[status as keyof typeof PROKER_STATUS_LABELS]}`, variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Gagal update status', variant: 'destructive' })
    }
  }

  return (
    <Select onValueChange={updateStatus} value={proker.status}>
      <SelectTrigger className="w-40" disabled={loading}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(['RENCANA', 'BERJALAN', 'SELESAI', 'DIBATALKAN'] as const).map((s) => (
          <SelectItem key={s} value={s}>
            {PROKER_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function TaskList({
  prokerId,
  tasks,
  users,
  user,
  canManage,
}: {
  prokerId: string
  tasks: { id: string; title: string; status: string }[]
  users: UserOption[]
  user: { id: string; role: string; divisionId: string | null }
  canManage: boolean
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [adding, setAdding] = useState(false)

  async function addTask() {
    if (!title.trim()) return
    setAdding(true)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, prokerId, assigneeId: assigneeId || null }),
    })
    setAdding(false)
    if (res.ok) {
      toast({ title: 'Task ditambahkan', variant: 'success' })
      setTitle('')
      setAssigneeId('')
      setShowForm(false)
      router.refresh()
    } else {
      toast({ title: 'Gagal menambah task', variant: 'destructive' })
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast({ title: 'Status task diupdate', variant: 'success' })
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal update', description: data?.error, variant: 'destructive' })
    }
  }

  if (tasks.length === 0 && !canManage) {
    return <p className="text-sm text-muted-foreground">Belum ada task untuk proker ini.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <ListTodo className="h-4 w-4" /> Task ({tasks.length})
        </p>
        {canManage && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-3.5 w-3.5" /> Task
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul task"
          />
          <div className="flex gap-2">
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Assign ke (opsional)" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addTask} disabled={adding || !title.trim()}>
              {adding && <Loader2 className="h-4 w-4 animate-spin" />} Tambah
            </Button>
          </div>
        </div>
      )}

      {tasks.length > 0 && (
        <div className="divide-y rounded-lg border">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <p className="text-sm">{t.title}</p>
              <Select value={t.status} onValueChange={(s) => updateStatus(t.id, s)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['BELUM', 'BERJALAN', 'SELESAI'] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
