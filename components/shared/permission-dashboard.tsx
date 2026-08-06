'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDateTime } from '@/lib/utils'
import {
  PERMISSION_STATUS_LABELS,
  PERMISSION_STATUS_BADGE,
} from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'

type PermissionData = {
  id: string
  reason: string
  sessionTitle: string
  sessionId: string | null
  startTime: string | null
  status: 'PENDING' | 'DISETUJUI' | 'DITOLAK'
  requester: {
    id: string
    name: string
    divisionId: string | null
    division: { name: string } | null
  }
  approvedBy: { id: string; name: string } | null
  responseNote: string | null
  decidedAt: string | null
  createdAt: string
}

type PermissionDashboardProps = {
  user: { id: string; role: string; divisionId: string | null }
  permissions: PermissionData[]
}

export function PermissionDashboard({ user, permissions }: PermissionDashboardProps) {
  const router = useRouter()
  const canManage = user.role === 'KADIV' || user.role === 'BPH'
  const [showForm, setShowForm] = useState(false)
  const [detail, setDetail] = useState<PermissionData | null>(null)

  const myPermissions = permissions.filter((p) => p.requester.id === user.id)
  const pendingInbox = permissions.filter(
    (p) => p.status === 'PENDING' && p.requester.id !== user.id
  )

  async function decide(id: string, action: 'DISETUJUI' | 'DITOLAK') {
    const res = await fetch(`/api/permissions/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      toast({
        title: action === 'DISETUJUI' ? 'Izin disetujui' : 'Izin ditolak',
        variant: 'success',
      })
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal memproses', description: data?.error, variant: 'destructive' })
    }
  }

  return (
    <Tabs defaultValue="mine">
      <TabsList>
        <TabsTrigger value="mine">Riwayat Saya</TabsTrigger>
        {canManage && <TabsTrigger value="inbox">Masuk ({pendingInbox.length})</TabsTrigger>}
      </TabsList>

      <TabsContent value="mine" className="space-y-6">
        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" /> Ajukan Izin
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showForm ? (
                <PermissionForm
                  onDone={() => {
                    setShowForm(false)
                    router.refresh()
                  }}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <Button variant="outline" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" /> Buat Pengajuan
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {myPermissions.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat izin"
            description="Setiap izin yang Anda ajukan akan tercatat di sini."
          />
        ) : (
          <div className="space-y-3">
            {myPermissions.map((p) => (
              <PermissionRow key={p.id} permission={p} onOpen={() => setDetail(p)} />
            ))}
          </div>
        )}
      </TabsContent>

      {canManage && (
        <TabsContent value="inbox">
          {pendingInbox.length === 0 ? (
            <EmptyState title="Tidak ada permohonan izin menunggu" />
          ) : (
            <div className="space-y-3">
              {pendingInbox.map((p) => (
                <div key={p.id} className="rounded-lg border bg-card p-4">
                  <button
                    type="button"
                    onClick={() => setDetail(p)}
                    className="w-full text-left transition-colors hover:opacity-80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{p.sessionTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.requester.division?.name ?? '—'} · {formatDateTime(p.createdAt)}
                        </p>
                      </div>
                      <Badge className={PERMISSION_STATUS_BADGE[p.status]}>
                        {PERMISSION_STATUS_LABELS[p.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm">{p.reason}</p>
                    {p.startTime && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Kegiatan: {formatDateTime(p.startTime)}
                      </p>
                    )}
                  </button>
                  <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => decide(p.id, 'DITOLAK')}
                    >
                      <X className="h-4 w-4" /> Tolak
                    </Button>
                    <Button size="sm" onClick={() => decide(p.id, 'DISETUJUI')}>
                      <Check className="h-4 w-4" /> Setujui
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      )}

      <PermissionDetailDialog permission={detail} onOpenChange={(o) => !o && setDetail(null)} />
    </Tabs>
  )
}

function PermissionDetailDialog({
  permission,
  onOpenChange,
}: {
  permission: PermissionData | null
  onOpenChange: (open: boolean) => void
}) {
  if (!permission) return null

  const p = permission

  return (
    <Dialog open={!!permission} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className={PERMISSION_STATUS_BADGE[p.status]}>
              {PERMISSION_STATUS_LABELS[p.status]}
            </Badge>
          </div>
          <DialogTitle className="text-xl leading-snug text-left">{p.sessionTitle}</DialogTitle>
          <DialogDescription className="text-left">
            <span className="flex items-center gap-1.5">
              {p.requester.name}
              {p.requester.division?.name ? ` · ${p.requester.division.name}` : ''}
            </span>
            <span className="mt-1 block">Diajukan: {formatDateTime(p.createdAt)}</span>
            {p.startTime && (
              <span className="mt-1 block">Kegiatan: {formatDateTime(p.startTime)}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border-t border-border pt-4">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Alasan
            </p>
            <p className="text-sm leading-6">{p.reason}</p>
          </div>

          {p.decidedAt && p.approvedBy && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Diproses oleh
              </p>
              <p className="text-sm">
                {p.approvedBy.name} · {formatDateTime(p.decidedAt)}
              </p>
            </div>
          )}

          {p.responseNote && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Catatan
              </p>
              <p className="text-sm">{p.responseNote}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PermissionRow({
  permission: p,
  compact = false,
  onOpen,
}: {
  permission: PermissionData
  compact?: boolean
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full cursor-pointer rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{p.sessionTitle}</p>
          <p className="text-sm text-muted-foreground">
            {!compact && <span>{p.requester.name} · </span>}
            {p.requester.division?.name ?? '—'} · {formatDateTime(p.createdAt)}
          </p>
        </div>
        <Badge className={PERMISSION_STATUS_BADGE[p.status]}>
          {PERMISSION_STATUS_LABELS[p.status]}
        </Badge>
      </div>
      <p className="mt-2 text-sm">{p.reason}</p>
      {p.startTime && (
        <p className="mt-1 text-xs text-muted-foreground">
          Kegiatan: {formatDateTime(p.startTime)}
        </p>
      )}
      {p.decidedAt && p.approvedBy && (
        <p className="mt-1 text-xs text-muted-foreground">
          Diproses oleh {p.approvedBy.name} · {formatDateTime(p.decidedAt)}
        </p>
      )}
      {p.responseNote && (
        <p className="mt-1 text-xs text-muted-foreground">Catatan: {p.responseNote}</p>
      )}
    </button>
  )
}

function PermissionForm({
  onDone,
  onCancel,
}: {
  onDone: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [reason, setReason] = useState('')
  const [startTime, setStartTime] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionTitle,
        reason,
        startTime: startTime ? new Date(startTime).toISOString() : null,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: 'Izin diajukan', description: 'Menunggu persetujuan kadiv.', variant: 'success' })
      onDone()
    } else {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal mengajukan izin', description: data?.error, variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="perm-session">Nama Rapat / Kegiatan</Label>
        <Input
          id="perm-session"
          value={sessionTitle}
          onChange={(e) => setSessionTitle(e.target.value)}
          placeholder="misal: Rapat Mingguan PSDM"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="perm-reason">Alasan</Label>
        <Textarea
          id="perm-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Alasan tidak dapat hadir"
          rows={3}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="perm-time">Waktu Kegiatan (opsional)</Label>
        <Input
          id="perm-time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Ajukan
        </Button>
      </div>
    </form>
  )
}
