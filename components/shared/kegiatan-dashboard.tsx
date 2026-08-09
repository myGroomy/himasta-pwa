'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  Plus,
  QrCode,
  ScanLine,
  Square,
  Users,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ATTENDANCE_STATUS_LABELS, KEGIATAN_CATEGORY_LABELS, KEGIATAN_CATEGORY_BADGE } from '@/lib/constants'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SessionForm } from '@/components/shared/session-form'
import { QrDialog } from '@/components/shared/qr-dialog'
import { MyQrDialog } from '@/components/shared/my-qr-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

type SessionData = {
  id: string
  title: string
  description: string | null
  category: string
  startTime: string
  endTime: string | null
  isActive: boolean
  division: { id: string; name: string; slug: string } | null
  createdBy: { id: string; name: string }
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

type KegiatanDashboardProps = {
  user: { id: string; role: string; divisionId: string | null }
  sessions: SessionData[]
  myRecords: MyRecord[]
  divisions: DivisionOption[]
}

export function KegiatanDashboard({ user, sessions, myRecords, divisions }: KegiatanDashboardProps) {
  const router = useRouter()
  const canManage = user.role === 'KADIV' || user.role === 'BPH'
  const canScanMember = canManage
  const [qrSession, setQrSession] = useState<SessionData | null>(null)
  const [myQrOpen, setMyQrOpen] = useState(false)
  const [closingId, setClosingId] = useState<string | null>(null)
  const [detailSession, setDetailSession] = useState<SessionData | null>(null)
  const [divisionFilter, setDivisionFilter] = useState('all')

  const activeSessions = sessions.filter((s) => s.isActive)
  const pastSessions = sessions.filter((s) => !s.isActive)

  const orgSessions = activeSessions.filter((s) => !s.division)
  const divSessions = activeSessions.filter(
    (s) =>
      s.division &&
      (divisionFilter === 'all' || s.division.id === divisionFilter)
  )

  async function closeSession(id: string) {
    setClosingId(id)
    const res = await fetch(`/api/attendance/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false, endTime: new Date().toISOString() }),
    })
    setClosingId(null)
    if (res.ok) {
      toast({ title: 'Kegiatan ditutup', variant: 'success' })
      router.refresh()
    } else {
      toast({ title: 'Gagal menutup kegiatan', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Cara absen: pindai QR kegiatan yang ditampilkan panitia, atau tunjukkan QR Saya ke BPH/Kadiv.
        </p>
        <Button variant="outline" size="sm" onClick={() => setMyQrOpen(true)}>
          <QrCode className="h-4 w-4" /> QR Saya
        </Button>
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" /> Buat Kegiatan
            </CardTitle>
            <CardDescription>
              Jadwalkan rapat, makrab, mubes, atau proker. Setelah dibuat, tampilkan QR-nya
              agar anggota bisa absen via scan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionForm divisions={divisions} userDivisionId={user.divisionId} isBPH={user.role === 'BPH'} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="organisasi">
        <TabsList className="flex-wrap">
          <TabsTrigger value="organisasi">Organisasi</TabsTrigger>
          <TabsTrigger value="divisi">Divisi</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="organisasi" className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Kegiatan Organisasi</h2>
              <p className="text-sm text-muted-foreground">Wajib dihadiri seluruh anggota HIMASTA.</p>
            </div>
            <Badge variant="outline">{orgSessions.length} aktif</Badge>
          </div>
          {orgSessions.length === 0 ? (
            <EmptyState
              title="Belum ada kegiatan organisasi"
              description={canManage ? 'Buat kegiatan dengan cakupan Organisasi di atas.' : 'Belum ada kegiatan organisasi yang berjalan.'}
            />
          ) : (
            <div className="space-y-3">
              {orgSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  canManage={canManage}
                  canScanMember={canScanMember}
                  onShowQr={() => setQrSession(s)}
                  onShowMyQr={() => setMyQrOpen(true)}
                  onClose={() => closeSession(s.id)}
                  closing={closingId === s.id}
                  onDetail={() => setDetailSession(s)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="divisi" className="space-y-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Kegiatan Divisi</h2>
              <p className="text-sm text-muted-foreground">Kegiatan internal per divisi.</p>
            </div>
            {user.role === 'BPH' && (
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semua divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua divisi</SelectItem>
                  {divisions.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          {divSessions.length === 0 ? (
            <EmptyState
              title="Belum ada kegiatan divisi"
              description={canManage ? 'Buat kegiatan dengan cakupan divisi di atas.' : 'Belum ada kegiatan divisi Anda yang berjalan.'}
            />
          ) : (
            <div className="space-y-3">
              {divSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  canManage={canManage}
                  canScanMember={canScanMember}
                  onShowQr={() => setQrSession(s)}
                  onShowMyQr={() => setMyQrOpen(true)}
                  onClose={() => closeSession(s.id)}
                  closing={closingId === s.id}
                  onDetail={() => setDetailSession(s)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="riwayat" className="space-y-6 pt-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Riwayat Kegiatan</h2>
              <Badge variant="outline">{pastSessions.length} selesai</Badge>
            </div>
            {pastSessions.length === 0 ? (
              <EmptyState
                title="Belum ada riwayat"
                description="Kegiatan yang sudah ditutup akan muncul di sini."
              />
            ) : (
              <div className="space-y-3">
              {pastSessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  canManage={canManage}
                  canScanMember={canScanMember}
                  onShowQr={() => {}}
                  onShowMyQr={() => setMyQrOpen(true)}
                  onClose={() => {}}
                  closing={false}
                  onDetail={() => setDetailSession(s)}
                />
              ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Riwayat Kehadiran Saya</h2>
              <Badge variant="outline">{myRecords.length} hadir</Badge>
            </div>
            {myRecords.length === 0 ? (
              <EmptyState
                title="Belum ada riwayat kehadiran"
                description="Setiap kali Anda hadir lewat scan QR, riwayatnya muncul di sini."
              />
            ) : (
              <Card>
                <CardContent className="divide-y">
                  {myRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-medium">{r.session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {r.session.division?.name ?? 'Organisasi'} · {formatDateTime(r.scannedAt)}
                        </p>
                      </div>
                      <Badge variant="success">Hadir</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <QrDialog
        sessionId={qrSession?.id ?? ''}
        sessionTitle={qrSession?.title ?? ''}
        open={!!qrSession}
        onOpenChange={(open) => !open && setQrSession(null)}
      />

      <MyQrDialog open={myQrOpen} onOpenChange={setMyQrOpen} />

      <SessionDetailDialog
        session={detailSession}
        onOpenChange={(open) => !open && setDetailSession(null)}
        canManage={canManage}
        canScanMember={canScanMember}
        onShowQr={() => detailSession && setQrSession(detailSession)}
        onShowMyQr={() => setMyQrOpen(true)}
        onClose={() => detailSession && closeSession(detailSession.id)}
        closing={closingId === detailSession?.id}
      />
    </div>
  )
}

function SessionDetailDialog({
  session,
  onOpenChange,
  canManage,
  canScanMember,
  onShowQr,
  onShowMyQr,
  onClose,
  closing,
}: {
  session: SessionData | null
  onOpenChange: (open: boolean) => void
  canManage: boolean
  canScanMember: boolean
  onShowQr: () => void
  onShowMyQr: () => void
  onClose: () => void
  closing: boolean
}) {
  if (!session) return null

  const category = (KEGIATAN_CATEGORY_LABELS as Record<string, string>)[session.category] ?? session.category

  return (
    <Dialog open={!!session} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  session.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                }`}
              />
              {session.isActive ? 'Berlangsung' : 'Selesai'}
            </span>
            <Badge className={KEGIATAN_CATEGORY_BADGE[session.category as keyof typeof KEGIATAN_CATEGORY_BADGE]}>
              {category}
            </Badge>
          </div>
          <DialogTitle className="text-xl leading-snug text-left">{session.title}</DialogTitle>
          <DialogDescription className="text-left">
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatDateTime(session.startTime)}
              {session.endTime && ` — ${formatDateTime(session.endTime)}`}
            </span>
            <span className="mt-1 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {Object.values(session.statusCounts ?? {}).reduce((a, b) => a + b, 0)} hadir
            </span>
            <span className="mt-1 flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {session.division?.name ?? 'Organisasi'}
            </span>
            <span className="mt-1 flex items-center gap-1.5">
              Dibuat oleh {session.createdBy.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        {session.description && (
          <div className="border-t border-border pt-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {session.description}
            </p>
          </div>
        )}

        {session.statusCounts && canManage && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
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

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {session.isActive && (
            <>
              {canScanMember ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/kegiatan/scan?session=${session.id}`}>
                    <ScanLine className="h-4 w-4" /> Scan
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/kegiatan/scan">
                    <ScanLine className="h-4 w-4" /> Absen
                  </Link>
                </Button>
              )}
              {canManage ? (
                <Button variant="outline" size="sm" onClick={onShowQr}>
                  <QrCode className="h-4 w-4" /> QR
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onShowMyQr}>
                  <QrCode className="h-4 w-4" /> QR Saya
                </Button>
              )}
              {canManage && (
                <Button variant="outline" size="sm" onClick={onClose} disabled={closing}>
                  <Square className="h-3.5 w-3.5" /> Tutup
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SessionCard({
  session,
  canManage,
  canScanMember,
  onShowQr,
  onShowMyQr,
  onClose,
  closing,
  onDetail,
}: {
  session: SessionData
  canManage: boolean
  canScanMember: boolean
  onShowQr: () => void
  onShowMyQr: () => void
  onClose: () => void
  closing: boolean
  onDetail: () => void
}) {
  const category = (KEGIATAN_CATEGORY_LABELS as Record<string, string>)[session.category] ?? session.category

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onDetail}
          className="flex flex-1 cursor-pointer items-start gap-3 rounded-lg p-2 -m-2 text-left transition-colors hover:bg-muted/50"
        >
          <div
            className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
              session.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
            }`}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold leading-tight">{session.title}</p>
              <Badge className={KEGIATAN_CATEGORY_BADGE[session.category as keyof typeof KEGIATAN_CATEGORY_BADGE]}>
                {category}
              </Badge>
            </div>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDateTime(session.startTime)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {Object.values(session.statusCounts ?? {}).reduce((a, b) => a + b, 0)} hadir
              </span>
              <span className="flex items-center gap-1">
                <UserRound className="h-3.5 w-3.5" />
                {session.division?.name ?? 'Organisasi'}
              </span>
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {session.isActive && (
            <>
              {canScanMember ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/kegiatan/scan?session=${session.id}`}>
                    <ScanLine className="h-4 w-4" /> Scan
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href="/kegiatan/scan">
                    <ScanLine className="h-4 w-4" /> Absen
                  </Link>
                </Button>
              )}
              {canManage ? (
                <Button variant="outline" size="sm" onClick={onShowQr}>
                  <QrCode className="h-4 w-4" /> QR
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={onShowMyQr}>
                  <QrCode className="h-4 w-4" /> QR Saya
                </Button>
              )}
              {canManage && (
                <Button variant="outline" size="sm" onClick={onClose} disabled={closing}>
                  <Square className="h-3.5 w-3.5" /> Tutup
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
