'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Calendar, Plus, Archive, CheckCircle2, Users,
  AlertTriangle, Loader2, ChevronRight
} from 'lucide-react'

type Period = {
  id: string
  name: string
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  _count: { memberHistories: number }
}

export function PeriodeManager({ initialPeriods }: { initialPeriods: Period[] }) {
  const [periods, setPeriods] = useState(initialPeriods)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', startDate: '' })
  const [loading, setLoading] = useState(false)
  const [closing, setClosing] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!formData.name || !formData.startDate) {
      setError('Nama periode dan tanggal mulai wajib diisi')
      return
    }
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      // Reload
      window.location.reload()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal membuat periode')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = async (id: string, name: string) => {
    if (!confirm(`Tutup periode "${name}"? Semua anggota aktif akan menjadi alumni. Tindakan ini tidak bisa dibatalkan.`)) return
    setClosing(id)
    try {
      const r = await fetch(`/api/periods/${id}/close`, { method: 'POST' })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      alert(data.message)
      window.location.reload()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Gagal menutup periode')
    } finally {
      setClosing(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Active period highlight */}
      {periods.find(p => p.isActive) && (() => {
        const active = periods.find(p => p.isActive)!
        return (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-primary uppercase tracking-wide">Periode Aktif</p>
                <h2 className="text-xl font-bold">{active.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Mulai: {format(new Date(active.startDate), 'd MMMM yyyy', { locale: id })}
                  {' · '}{active._count.memberHistories} anggota terdaftar
                </p>
              </div>
              <button
                onClick={() => handleClose(active.id, active.name)}
                disabled={closing === active.id}
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                {closing === active.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Archive className="h-3.5 w-3.5" />
                }
                Tutup Periode
              </button>
            </div>
          </div>
        )
      })()}

      {/* Warning if no active period */}
      {!periods.find(p => p.isActive) && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Tidak ada periode aktif</p>
            <p className="text-sm mt-0.5">Buat periode baru untuk memulai siklus kepengurusan.</p>
          </div>
        </div>
      )}

      {/* Create new period */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Buat Periode Baru
        </button>
      ) : (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Periode Kepengurusan Baru
          </h3>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nama Periode</label>
              <input
                type="text"
                placeholder="contoh: 2025/2026"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <AlertTriangle className="mb-1 h-4 w-4" />
            Membuat periode baru akan otomatis menonaktifkan periode yang sedang berjalan dan mendaftarkan semua anggota aktif ke periode baru.
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Buat Periode
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-accent"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* History list */}
      <div>
        <h3 className="mb-3 font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Riwayat Periode
        </h3>
        <div className="space-y-2">
          {periods.filter(p => !p.isActive).map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-card px-5 py-3.5 hover:bg-accent/30 transition-colors">
              <Archive className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(p.startDate), 'd MMM yyyy', { locale: id })}
                  {p.endDate && ` – ${format(new Date(p.endDate), 'd MMM yyyy', { locale: id })}`}
                  {' · '}{p._count.memberHistories} anggota tercatat
                </p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Arsip
              </span>
            </div>
          ))}
          {periods.filter(p => !p.isActive).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada riwayat periode</p>
          )}
        </div>
      </div>
    </div>
  )
}
