'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, isToday, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  Camera,
  CheckCircle2,
  Trash2,
  Plus,
  Loader2,
  Image as ImageIcon,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { EmptyState } from '@/components/shared/empty-state'

type UserOption = {
  id: string
  name: string
  nim: string | null
  role: string
  division: { name: string } | null
}

type PiketData = {
  id: string
  date: string
  userId: string
  status: 'BELUM' | 'HADIR' | 'ABSEN'
  beforePhoto: string | null
  afterPhoto: string | null
  checkedInAt: string | null
  createdAt: string
  updatedAt: string
  user: UserOption
}

type PiketDashboardProps = {
  currentUser: { id: string; role: string }
  initialPikets: PiketData[]
  users: UserOption[]
}

export function PiketDashboard({ currentUser, initialPikets, users }: PiketDashboardProps) {
  const router = useRouter()
  const isBPH = currentUser.role === 'BPH'
  const [pikets, setPikets] = useState<PiketData[]>(initialPikets)
  const [loadingUpload, setLoadingUpload] = useState<'before' | 'after' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // BPH Form State
  const [targetUserId, setTargetUserId] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [assigning, setAssigning] = useState(false)

  // My Picket for today
  const myTodayPiket = pikets.find(
    (p) => p.userId === currentUser.id && isToday(parseISO(p.date))
  )

  // Upcoming Pickets
  const upcomingPikets = pikets.filter(
    (p) => parseISO(p.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  )

  // Past Pickets
  const pastPikets = pikets.filter(
    (p) => parseISO(p.date) < new Date(new Date().setHours(0, 0, 0, 0))
  ).reverse() // reverse to show latest first

  // Handle Photo Upload
  async function handlePhotoUpload(piketId: string, type: 'before' | 'after', file: File) {
    if (!file) return

    setLoadingUpload(type)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // 1. Upload file
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error('Upload foto gagal')
      }

      const { url } = await uploadRes.json()

      // 2. Patch Piket details
      const patchData: any = {}
      if (type === 'before') patchData.beforePhoto = url
      if (type === 'after') patchData.afterPhoto = url

      const patchRes = await fetch(`/api/piket/${piketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      })

      if (!patchRes.ok) {
        throw new Error('Gagal mencatat absensi piket')
      }

      const updated = await patchRes.json()

      // 3. Update State
      setPikets((prev) =>
        prev.map((item) => (item.id === piketId ? updated.piket : item))
      )

      toast({
        title: type === 'before' ? 'Absen Masuk Berhasil' : 'Absen Pulang Berhasil',
        description: type === 'before' ? 'Foto sebelum piket berhasil dicatat.' : 'Piket selesai dan terabsen!',
        variant: 'success',
      })
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Error Absensi',
        description: error.message || 'Terjadi kesalahan sistem.',
        variant: 'destructive',
      })
    } finally {
      setLoadingUpload(null)
    }
  }

  // Handle Assign Picket (BPH)
  async function handleAssign(e: React.FormEvent) {
    e.preventDefault()
    if (!targetUserId || !targetDate) {
      toast({ title: 'Data belum lengkap', description: 'Pilih anggota dan tanggal piket.', variant: 'destructive' })
      return
    }

    setAssigning(true)
    try {
      const res = await fetch('/api/piket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId, date: targetDate }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menambahkan jadwal piket')
      }

      setPikets((prev) => [...prev, data.piket].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setTargetUserId('')
      setTargetDate('')
      toast({ title: 'Jadwal piket ditambahkan', variant: 'success' })
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Gagal membuat jadwal', description: error.message, variant: 'destructive' })
    } finally {
      setAssigning(false)
    }
  }

  // Handle Delete Picket (BPH)
  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal piket ini?')) return

    try {
      const res = await fetch(`/api/piket/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Gagal menghapus jadwal piket')
      }

      setPikets((prev) => prev.filter((p) => p.id !== id))
      toast({ title: 'Jadwal piket dihapus', variant: 'success' })
      router.refresh()
    } catch (error: any) {
      toast({ title: 'Gagal menghapus', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Today's Picket Check-in Section (Only shows if assigned today) */}
      {myTodayPiket && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <UserCheck className="h-5 w-5" /> Jadwal Piket Anda Hari Ini!
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300">
              Silakan lakukan absensi dengan mengunggah foto kondisi sekretariat sebelum dan sesudah piket.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-zinc-900 border rounded-xl p-4 shadow-sm">
              <div>
                <p className="font-semibold text-foreground">
                  Tanggal: {format(parseISO(myTodayPiket.date), 'EEEE, dd MMMM yyyy', { locale: id })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Status Absen: <span className="font-bold text-primary">{myTodayPiket.status}</span>
                </p>
              </div>

              {myTodayPiket.status === 'HADIR' && (
                <Badge variant="success" className="gap-1 text-xs px-3 py-1">
                  <CheckCircle2 className="h-4.5 w-4.5" /> Hadir Piket
                </Badge>
              )}
            </div>

            {/* Upload Area */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Before Photo */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-card">
                <span className="text-sm font-semibold text-foreground mb-3">Foto Sebelum Piket (Mulai)</span>
                {myTodayPiket.beforePhoto ? (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={myTodayPiket.beforePhoto} alt="Kondisi Sebelum" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <label className="w-full flex flex-col items-center justify-center gap-2 p-8 border border-slate-200 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors">
                    {loadingUpload === 'before' ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">Pilih/Ambil Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={loadingUpload !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(myTodayPiket.id, 'before', file)
                      }}
                    />
                  </label>
                )}
              </div>

              {/* After Photo */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-card">
                <span className="text-sm font-semibold text-foreground mb-3">Foto Sesudah Piket (Selesai)</span>
                {myTodayPiket.afterPhoto ? (
                  <div className="relative h-40 w-full rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={myTodayPiket.afterPhoto} alt="Kondisi Sesudah" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <label
                    className={`w-full flex flex-col items-center justify-center gap-2 p-8 border border-slate-200 rounded-lg transition-colors ${
                      !myTodayPiket.beforePhoto
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-muted/40 cursor-pointer'
                    }`}
                  >
                    {loadingUpload === 'after' ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">Pilih/Ambil Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      disabled={!myTodayPiket.beforePhoto || loadingUpload !== null}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(myTodayPiket.id, 'after', file)
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Jadwal Mendatang</TabsTrigger>
          <TabsTrigger value="past">Riwayat Piket</TabsTrigger>
          {isBPH && <TabsTrigger value="manage">Kelola Piket (BPH)</TabsTrigger>}
        </TabsList>

        {/* Tab Upcoming */}
        <TabsContent value="upcoming" className="space-y-4 pt-4">
          {upcomingPikets.length === 0 ? (
            <EmptyState title="Belum ada jadwal piket mendatang" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {upcomingPikets.map((p) => (
                <PiketCard key={p.id} piket={p} showActions={isBPH} onDelete={() => handleDelete(p.id)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Past */}
        <TabsContent value="past" className="space-y-4 pt-4">
          {pastPikets.length === 0 ? (
            <EmptyState title="Belum ada riwayat piket" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pastPikets.map((p) => (
                <PiketCard key={p.id} piket={p} showActions={isBPH} onDelete={() => handleDelete(p.id)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Manage (BPH Only) */}
        {isBPH && (
          <TabsContent value="manage" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Buat Jadwal Piket Baru</CardTitle>
                <CardDescription>
                  Tugaskan anggota kepengurusan untuk melaksanakan piket harian sekretariat.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssign} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="assignee">Pilih Anggota</Label>
                      <select
                        id="assignee"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="">-- Pilih Anggota --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.division?.name ?? 'BPH'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 text-left">
                      <Label htmlFor="date">Tanggal Piket</Label>
                      <Input
                        id="date"
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={assigning} className="w-full">
                    {assigning ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Tambahkan ke Jadwal
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* List All with Delete Option */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Semua Jadwal Piket</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {pikets.map((p) => (
                  <PiketCard key={p.id} piket={p} showActions={true} onDelete={() => handleDelete(p.id)} />
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

function PiketCard({
  piket,
  showActions = false,
  onDelete,
}: {
  piket: PiketData
  showActions?: boolean
  onDelete?: () => void
}) {
  const [photoOpen, setPhotoOpen] = useState<'before' | 'after' | null>(null)

  return (
    <>
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="pt-6 flex flex-col justify-between h-full gap-3">
          <div className="text-left">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm leading-snug">{piket.user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {piket.user.division?.name ?? 'BPH'} · NIM: {piket.user.nim ?? '—'}
                </p>
              </div>
              <Badge variant={piket.status === 'HADIR' ? 'success' : 'secondary'} className="text-[10px]">
                {piket.status}
              </Badge>
            </div>

            <div className="mt-3 flex flex-col gap-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(parseISO(piket.date), 'EEEE, dd MMMM yyyy', { locale: id })}
              </span>
              {piket.checkedInAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Checked-in: {format(parseISO(piket.checkedInAt), 'HH:mm - dd MMM', { locale: id })}
                </span>
              )}
            </div>

            {/* Photo links */}
            {(piket.beforePhoto || piket.afterPhoto) && (
              <div className="mt-3 flex gap-2">
                {piket.beforePhoto && (
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setPhotoOpen('before')}>
                    <ImageIcon className="h-3 w-3" /> Foto Sebelum
                  </Button>
                )}
                {piket.afterPhoto && (
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => setPhotoOpen('after')}>
                    <ImageIcon className="h-3 w-3" /> Foto Sesudah
                  </Button>
                )}
              </div>
            )}
          </div>

          {showActions && onDelete && (
            <div className="flex justify-end border-t pt-3">
              <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={onDelete}>
                <Trash2 className="h-4 w-4" /> Hapus
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Viewer Modal */}
      {photoOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-xl overflow-hidden max-w-lg w-full flex flex-col border">
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold text-sm">
                Foto {photoOpen === 'before' ? 'Sebelum Piket' : 'Sesudah Piket'} - {piket.user.name}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setPhotoOpen(null)}>Tutup</Button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoOpen === 'before' ? piket.beforePhoto! : piket.afterPhoto!}
                alt="Foto Bukti"
                className="max-h-[60vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
