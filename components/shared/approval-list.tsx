'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CheckCheck, X, Loader2, Eye, MessageSquareQuote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'

type PendingAnnouncement = {
  id: string
  title: string
  content: string
  category: string
  scope: 'GENERAL' | 'DIVISION'
  division: { id: string; name: string; slug: string } | null
  visibleToDosen: boolean
  author: { id: string; name: string; email: string; role: string }
  createdAt: string
}

export function ApprovalList({ initial }: { initial: PendingAnnouncement[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<PendingAnnouncement | null>(null)
  const [rejecting, setRejecting] = useState<PendingAnnouncement | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [bulkReject, setBulkReject] = useState(false)

  if (items.length === 0) return null

  const allSelected = items.every((a) => selected.has(a.id))
  const someSelected = selected.size > 0 && !allSelected
  const selectedItems = items.filter((a) => selected.has(a.id))

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) items.forEach((a) => next.delete(a.id))
      else items.forEach((a) => next.add(a.id))
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

  function setBusy(id: string, busy: boolean) {
    setBusyIds((prev) => {
      const next = new Set(prev)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function decideOne(a: PendingAnnouncement, action: 'approve' | 'reject', note?: string) {
    setBusy(a.id, true)
    const res = await fetch(`/api/announcements/${a.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...(action === 'reject' ? { reason: note } : { note }) }),
    })
    setBusy(a.id, false)

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal memproses', description: data?.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return false
    }

    toast({
      title: action === 'approve' ? 'Pengumuman disetujui' : 'Pengumuman ditolak',
      description: action === 'reject' ? note : undefined,
      variant: action === 'approve' ? 'success' : 'default',
    })
    setItems((prev) => prev.filter((x) => x.id !== a.id))
    setSelected((prev) => {
      const next = new Set(prev)
      next.delete(a.id)
      return next
    })
    router.refresh()
    return true
  }

  async function handleBulk(action: 'approve' | 'reject', note?: string) {
    if (selected.size === 0) return
    setBusyIds(new Set(selected))
    const res = await fetch('/api/announcements/bulk-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], action, note }),
    })
    setBusyIds(new Set())
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      toast({ title: 'Gagal proses massal', description: data?.error ?? 'Terjadi kesalahan', variant: 'destructive' })
      return
    }
    toast({
      title: action === 'approve' ? `${selected.size} pengumuman disetujui` : `${selected.size} pengumuman ditolak`,
      variant: 'success',
    })
    setItems((prev) => prev.filter((x) => !selected.has(x.id)))
    setSelected(new Set())
    router.refresh()
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected
            }}
            onChange={toggleAll}
            aria-label="Pilih semua"
            className="h-4 w-4 rounded border-input"
          />
          <span className="text-sm text-muted-foreground">
            {selected.size > 0 ? `${selected.size} dipilih` : 'Pilih semua'}
          </span>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleBulk('approve')}
              disabled={busyIds.size > 0}
            >
              <CheckCheck className="h-4 w-4" />
              Setujui {selected.size} pengumuman
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => {
                setBulkReject(true)
                setRejectReason('')
              }}
              disabled={busyIds.size > 0}
            >
              <X className="h-4 w-4" />
              Tolak massal
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {items.map((a) => {
          const busy = busyIds.has(a.id)
          return (
            <Card key={a.id}>
              <CardHeader className="pb-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(a.id)}
                    onChange={() => toggleOne(a.id)}
                    disabled={busy}
                    aria-label={`Pilih ${a.title}`}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Badge variant="outline">{a.scope === 'GENERAL' ? 'General' : a.division?.name ?? 'Divisi'}</Badge>
                  <Badge variant="secondary">{a.category}</Badge>
                  {a.visibleToDosen && <Badge variant="outline">Untuk dosen</Badge>}
                </div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <CardDescription className="line-clamp-3 whitespace-pre-line">{a.content}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {a.author.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {a.author.name} ({a.author.role}) · {a.author.email}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button variant="ghost" size="sm" onClick={() => setPreview(a)}>
                  <Eye className="h-4 w-4" />
                  Pratinjau
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setRejecting(a)
                    setRejectReason('')
                  }}
                  disabled={busy}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Tolak
                </Button>
                <Button size="sm" onClick={() => decideOne(a, 'approve')} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Setujui
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <PreviewDialog item={preview} onClose={() => setPreview(null)} />

      <RejectDialog
        open={!!rejecting || bulkReject}
        isBulk={bulkReject}
        count={selectedItems.length}
        reason={rejectReason}
        setReason={setRejectReason}
        onClose={() => {
          setRejecting(null)
          setBulkReject(false)
        }}
        onConfirm={async () => {
          if (!rejectReason.trim()) {
            toast({ title: 'Alasan wajib diisi', variant: 'destructive' })
            return
          }
          if (bulkReject) await handleBulk('reject', rejectReason.trim())
          else if (rejecting) await decideOne(rejecting, 'reject', rejectReason.trim())
          setRejecting(null)
          setBulkReject(false)
        }}
      />
    </>
  )
}

function PreviewDialog({
  item,
  onClose,
}: {
  item: PendingAnnouncement | null
  onClose: () => void
}) {
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6">{item?.title ?? ''}</DialogTitle>
          <DialogDescription>
            {item
              ? `${item.scope === 'GENERAL' ? 'General' : item.division?.name ?? 'Divisi'} · ${item.category} · oleh ${item.author.name} (${item.author.role})`
              : ''}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto whitespace-pre-line text-sm leading-7">
          {item?.content}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function RejectDialog({
  open,
  isBulk,
  count,
  reason,
  setReason,
  onClose,
  onConfirm,
}: {
  open: boolean
  isBulk: boolean
  count: number
  reason: string
  setReason: (v: string) => void
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareQuote className="h-4 w-4" />
            {isBulk ? `Tolak ${count} pengumuman` : 'Tolak pengumuman'}
          </DialogTitle>
          <DialogDescription>
            Alasan penolakan wajib diisi — akan dikirim ke penulis dan dicatat di audit trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reject-reason">Alasan penolakan</Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="misal: Konten belum lengkap, mohon tambahkan detail waktu dan tempat."
            maxLength={500}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!reason.trim()}
          >
            <X className="h-4 w-4" />
            Tolak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
