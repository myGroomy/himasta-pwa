'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Target, Calendar, FolderOpen, Plus,
  X, Check, Users, Clock, MapPin, FileText, ChevronRight, Archive, Loader2, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DiscussionPanel } from '@/components/discussions/discussion-panel'
import { formatDate } from '@/lib/utils'
import { DOC_CATEGORY_LABELS } from '@/lib/constants'
import { toast } from '@/components/ui/use-toast'

type Member = {
  id: string
  name: string
  nim: string | null
  role: string
}

type Document = {
  id: string
  title: string
  category: string
  createdAt: Date | string
  uploadedBy: {
    name: string
  }
  fileUrl: string
}

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  assignee: {
    name: string
  } | null
}

type AttendanceSession = {
  id: string
  title: string
  startTime: Date | string
  endTime: Date | string | null
  isActive: boolean
}

type Proker = {
  id: string
  name: string
  description: string | null
  status: string
  timeline: string | null
  pj: { name: string } | null
}

type DivisionWorkspaceViewProps = {
  division: {
    id: string
    name: string
    description: string | null
  }
  user: {
    id: string
    role: string
    divisionId: string | null
  }
  members: Member[]
  documents: Document[]
  tasks: Task[]
  sessions: AttendanceSession[]
  prokers: Proker[]
  canManage: boolean
}

export function DivisionWorkspaceView({
  division,
  user,
  members,
  documents,
  tasks,
  sessions,
  prokers,
  canManage
}: DivisionWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<'diskusi' | 'tugas' | 'rapat' | 'proker' | 'arsip'>('diskusi')
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddSessionModal, setShowAddSessionModal] = useState(false)

  // Form Tugas
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')
  const [taskSaving, setTaskSaving] = useState(false)

  // Form Rapat
  const [sessionTitle, setSessionTitle] = useState('')
  const [sessionDesc, setSessionDesc] = useState('')
  const [sessionSaving, setSessionSaving] = useState(false)

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    setTaskSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || null,
          divisionId: division.id,
          assigneeId: taskAssignee || null,
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        toast({ title: 'Tugas dibuat' })
        setShowAddTaskModal(false)
        setTaskTitle('')
        setTaskDesc('')
        setTaskAssignee('')
        window.location.reload()
      } else {
        toast({ title: data?.error || 'Gagal membuat tugas', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal membuat tugas', variant: 'destructive' })
    } finally {
      setTaskSaving(false)
    }
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionTitle.trim()) return
    setSessionSaving(true)
    try {
      const res = await fetch('/api/attendance/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sessionTitle.trim(),
          description: sessionDesc.trim() || null,
          divisionId: division.id,
          category: 'RAPAT',
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok) {
        toast({ title: 'Rapat dibuat', description: 'Sesi absensi rapat aktif. Bagikan QR ke anggota.' })
        setShowAddSessionModal(false)
        setSessionTitle('')
        setSessionDesc('')
        window.location.reload()
      } else {
        toast({ title: data?.error || 'Gagal membuat rapat', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Gagal membuat rapat', variant: 'destructive' })
    } finally {
      setSessionSaving(false)
    }
  }

  // Sub-tab Tugas filter
  const tasksBelum = tasks.filter((t) => t.status === 'BELUM')
  const tasksBerjalan = tasks.filter((t) => t.status === 'BERJALAN')
  const tasksSelesai = tasks.filter((t) => t.status === 'SELESAI')

  return (
    <div className="space-y-6 px-4 py-4 md:px-0 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Divisi {division.name}</h1>
        <p className="text-sm text-muted-foreground">{division.description ?? 'Workspace internal divisi'}</p>
      </div>

      {/* Segmented Control / Sub-Tabs */}
      <div className="flex border-b border-border">
        {[
          { key: 'diskusi', label: 'Diskusi', icon: MessageSquare },
          { key: 'tugas', label: 'Tugas', icon: Target },
          { key: 'rapat', label: 'Rapat', icon: Calendar },
          { key: 'proker', label: 'Proker', icon: FolderOpen },
          { key: 'arsip', label: 'Arsip', icon: Archive },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 pb-3 flex items-center justify-center gap-1.5 border-b-2 font-semibold text-sm transition-all ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === 'diskusi' && (
          <section className="space-y-4">
            <DiscussionPanel
              divisionId={division.id}
              currentUserId={user.id}
              canPost={canManage}
            />
          </section>
        )}

        {activeTab === 'tugas' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Papan Tugas Anggota</h3>
              {canManage && (
                <Button size="sm" onClick={() => setShowAddTaskModal(true)} className="gap-1.5 rounded-lg shadow-sm">
                  <Plus className="h-4 w-4" />
                  Tambah Tugas
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kolom Belum */}
              <div className="space-y-3 bg-secondary/35 p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Belum Mulai</span>
                  <Badge variant="outline">{tasksBelum.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tasksBelum.map((t) => (
                    <Card key={t.id} className="border border-border shadow-none rounded-lg bg-card">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t.title}</p>
                        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        <div className="text-[10px] font-medium text-muted-foreground pt-1 border-t border-border">
                          PJ: {t.assignee?.name ?? 'Belum ditugaskan'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Kolom Berjalan */}
              <div className="space-y-3 bg-secondary/35 p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-primary uppercase">Berjalan</span>
                  <Badge variant="outline">{tasksBerjalan.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tasksBerjalan.map((t) => (
                    <Card key={t.id} className="border border-border shadow-none rounded-lg bg-card">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-semibold text-foreground">{t.title}</p>
                        {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                        <div className="text-[10px] font-medium text-muted-foreground pt-1 border-t border-border">
                          PJ: {t.assignee?.name ?? 'Belum ditugaskan'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Kolom Selesai */}
              <div className="space-y-3 bg-secondary/35 p-3 rounded-xl border border-border">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-emerald-600 uppercase">Selesai</span>
                  <Badge variant="outline">{tasksSelesai.length}</Badge>
                </div>
                <div className="space-y-2">
                  {tasksSelesai.map((t) => (
                    <Card key={t.id} className="border border-border shadow-none rounded-lg bg-card">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-semibold text-foreground line-through">{t.title}</p>
                        {t.description && <p className="text-xs text-muted-foreground line-through">{t.description}</p>}
                        <div className="text-[10px] font-medium text-muted-foreground pt-1 border-t border-border">
                          PJ: {t.assignee?.name ?? 'Belum ditugaskan'}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'rapat' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Jadwal Rapat Divisi</h3>
              {canManage && (
                <Button size="sm" onClick={() => setShowAddSessionModal(true)} className="gap-1.5 rounded-lg shadow-sm">
                  <Plus className="h-4 w-4" />
                  Mulai Rapat Baru
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {sessions.length === 0 ? (
                <Card className="border border-border">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground text-sm">
                    Belum ada sesi rapat yang dijadwalkan.
                  </CardContent>
                </Card>
              ) : (
                sessions.map((s) => (
                  <Card key={s.id} className="bg-card border border-border rounded-xl p-4 shadow-none">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-base">{s.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(s.startTime)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={s.isActive ? 'success' : 'secondary'}>
                        {s.isActive ? 'Rapat Aktif' : 'Selesai'}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'proker' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Program Kerja Divisi</h3>
            </div>
            {prokers.length === 0 ? (
              <Card className="border border-border">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground text-sm">
                  Belum ada proker untuk divisi ini.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {prokers.map((p) => (
                  <Card key={p.id} className="border border-border rounded-xl shadow-none">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground">{p.name}</p>
                        <Badge variant={p.status === 'SELESAI' ? 'success' : p.status === 'BERJALAN' ? 'default' : 'secondary'} className="text-[9px] shrink-0">
                          {p.status}
                        </Badge>
                      </div>
                      {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-border text-[10px] text-muted-foreground">
                        <span>PJ: {p.pj?.name ?? 'Belum ditentukan'}</span>
                        {p.timeline && <span>{p.timeline}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'arsip' && (
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Arsip Berkas Divisi</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {documents.length === 0 ? (
                <div className="col-span-2 text-center text-muted-foreground text-sm py-10">
                  Belum ada dokumen divisi yang diunggah.
                </div>
              ) : (
                documents.map((d) => (
                  <Card key={d.id} className="border border-border rounded-xl shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-foreground">{d.title}</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {DOC_CATEGORY_LABELS[d.category as keyof typeof DOC_CATEGORY_LABELS]} · {formatDate(d.createdAt)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">oleh {d.uploadedBy.name}</p>
                        </div>
                        <Button asChild size="sm" variant="outline" className="border-border">
                          <Link href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                            Buka
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* Modal Tambah Tugas */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Tambah Tugas</h3>
              <button onClick={() => setShowAddTaskModal(false)} aria-label="Tutup" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={createTask} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-title" className="text-sm">Judul Tugas</Label>
                <Input
                  id="task-title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Contoh: Persiapan materi makrab"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-desc" className="text-sm">Deskripsi (opsional)</Label>
                <Textarea
                  id="task-desc"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Detail tugas…"
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-assignee" className="text-sm">Penanggung Jawab (opsional)</Label>
                <select
                  id="task-assignee"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">— Pilih anggota —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowAddTaskModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={taskSaving || !taskTitle.trim()}>
                  {taskSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Simpan Tugas
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mulai Rapat */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Mulai Rapat</h3>
              <button onClick={() => setShowAddSessionModal(false)} aria-label="Tutup" className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={createSession} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="session-title" className="text-sm">Judul Rapat</Label>
                <Input
                  id="session-title"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Contoh: Rapat koordinasi mingguan"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="session-desc" className="text-sm">Agenda (opsional)</Label>
                <Textarea
                  id="session-desc"
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  placeholder="Poin agenda rapat…"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowAddSessionModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={sessionSaving || !sessionTitle.trim()}>
                  {sessionSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Mulai Rapat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
