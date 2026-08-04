'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Plus,
  QrCode,
  ScanLine,
  Square,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SessionForm } from '@/components/shared/session-form'
import { QrDialog } from '@/components/shared/qr-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

type SessionData = {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string | null
  isActive: boolean
  division: { id: string; name: string; slug: string } | null
  createdBy: { id: string; name: string }
  _count: { records: number }
  statusCounts?: Record<string, number>
}

type MyRecord = {
  id: string
  scannedAt: string
  session: {
    id: string
    title: string
    startTime: string
    division: { id: string; name: string; slug: string } | null
  }
}

type DivisionOption = { id: string; name: string; slug: string }

type AttendanceDashboardProps = {
  user: { id: string; role: string; divisionId: string | null }
  sessions: SessionData[]
  myRecords: MyRecord[]
  divisions: DivisionOption[]
}

export function AttendanceDashboard({ user, sessions, myRecords, divisions }: AttendanceDashboardProps) {
  const router = useRouter()
  const canManage = user.role === 'KADIV' || user.role === 'BPH'
  const [qrSession, setQrSession] = useState<SessionData | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const activeSessions = sessions.filter((s) => s.isActive)
  const pastSessions = sessions.filter((s) => !s.isActive)

  async function closeSession(id: string) {
    setClosingId(id)
    const res = await fetch(`/api/attendance/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false, endTime: new Date().toISOString() }),
    })
    setClosingId(null)
    if (res.ok) {
      toast({ title: 'Sesi ditutup', variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Gagal menutup sesi', variant: 'destructive' })
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Tabs defaultValue="sessions">
      <TabsList>
        <TabsTrigger value="sessions">Sesi & Rekap</TabsTrigger>
        <TabsTrigger value="my">Riwayat Saya</TabsTrigger>
      </TabsList>

      <TabsContent value="sessions" className="space-y-6">
        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" /> Buat Sesi Absensi
              </CardTitle>
              <CardDescription>
                Buat sesi rapat, lalu tampilkan QR-nya agar anggota bisa absen via scan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionForm divisions={divisions} userDivisionId={user.divisionId} isBPH={user.role === 'BPH'} />
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold">Sesi Aktif</h2>
          {activeSessions.length === 0 ? (
            <EmptyState
              title="Tidak ada sesi aktif"
              description={canManage ? 'Buat sesi di atas untuk mulai absensi rapat.' : 'Belum ada sesi absensi yang berjalan.'}
            />
          ) : (
            <div className="space-y-3">
              {activeSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  canManage={canManage}
                  onShowQr={() => setQrSession(s)}
                  onClose={() => closeSession(s.id)}
                  closing={closingId === s.id}
                  expanded={expanded.has(s.id)}
                  onToggleExpand={() => toggleExpand(s.id)}
                />
              ))}
            </div>
          )}
        </div>

        {pastSessions.length > 0 && (
          <div>
            <h2 className="mb-3 text-lg font-semibold">Sesi Selesai</h2>
            <div className="space-y-3">
              {pastSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  canManage={canManage}
                  onShowQr={() => setQrSession(s)}
                  onClose={() => {}}
                  closing={false}
                  expanded={expanded.has(s.id)}
                  onToggleExpand={() => toggleExpand(s.id)}
                />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="my">
        {myRecords.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat kehadiran"
            description="Setiap kali Anda melakukan scan QR absensi, riwayatnya muncul di sini."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Riwayat Kehadiran</CardTitle>
              <CardDescription>{myRecords.length} sesi pernah dihadiri</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {myRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{r.session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.session.division?.name ?? 'General'} · {formatDateTime(r.scannedAt)}
                    </p>
                  </div>
                  <Badge variant="success">Hadir</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <QrDialog
        sessionId={qrSession?.id ?? ''}
        sessionTitle={qrSession?.title ?? ''}
        open={!!qrSession}
        onOpenChange={(open) => !open && setQrSession(null)}
      />
    </Tabs>
  )
}

function SessionCard({
  session,
  canManage,
  onShowQr,
  onClose,
  closing,
  expanded,
  onToggleExpand,
}: {
  session: SessionData
  canManage: boolean
  onShowQr: () => void
  onClose: () => void
  closing: boolean
  expanded: boolean
  onToggleExpand: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
              session.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            }`}
          />
          <div>
            <p className="font-semibold leading-tight">{session.title}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDateTime(session.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {session._count.records} hadir
              </span>
              <span>{session.division?.name ?? 'General'}</span>
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/absensi/scan">
              <ScanLine className="h-4 w-4" /> Scan
            </Link>
          </Button>
          {canManage && (
            <>
              <Button variant="outline" size="sm" onClick={onShowQr} disabled={!session.isActive}>
                <QrCode className="h-4 w-4" /> QR
              </Button>
              {session.isActive && (
                <Button variant="outline" size="sm" onClick={onClose} disabled={closing}>
                  <Square className="h-3.5 w-3.5" /> Tutup
                </Button>
              )}
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onToggleExpand} aria-label="Detail sesi">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>

      {expanded && (
        <CardContent className="border-t pt-4">
          {session.description && (
            <p className="mb-3 text-sm text-muted-foreground">{session.description}</p>
          )}
          {session.statusCounts && canManage && (
            <div className="mb-3 flex flex-wrap gap-2">
              {(['HADIR', 'IZIN', 'TANPA_KETERANGAN'] as const).map((s) => (
                <Badge
                  key={s}
                  variant={s === 'HADIR' ? 'success' : s === 'IZIN' ? 'info' : 'destructive'}
                >
                  {ATTENDANCE_STATUS_LABELS[s]}: {session.statusCounts?.[s] ?? 0}
                </Badge>
              ))}
            </div>
          )}
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dibuat oleh {session.createdBy.name}
          </p>
        </CardContent>
      )}
    </Card>
  )
}
