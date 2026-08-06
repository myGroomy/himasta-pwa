'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MessageSquare, Target, Calendar, FolderOpen, Plus,
  X, Check, Users, Clock, MapPin, FileText, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DiscussionPanel } from '@/components/discussions/discussion-panel'
import { formatDate } from '@/lib/utils'
import { DOC_CATEGORY_LABELS } from '@/lib/constants'

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
  canManage: boolean
}

export function DivisionWorkspaceView({
  division,
  user,
  members,
  documents,
  tasks,
  sessions,
  canManage
}: DivisionWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<'diskusi' | 'tugas' | 'rapat' | 'arsip'>('diskusi')
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const [showAddSessionModal, setShowAddSessionModal] = useState(false)

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
          { key: 'arsip', label: 'Arsip', icon: FolderOpen },
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

      {/* Modal Tambah Tugas (Popup Form) */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Tambah Tugas</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-muted-foreground">
              Form tambah tugas dapat diakses melalui menu admin proker & tugas.
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/20">
              <Button onClick={() => setShowAddTaskModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mulai Rapat (Popup Form) */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Mulai Rapat</h3>
              <button onClick={() => setShowAddSessionModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-muted-foreground">
              Silakan buat sesi absensi rapat baru di menu Kegiatan atau buat melalui shortcut portal beranda.
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/20">
              <Button onClick={() => setShowAddSessionModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
