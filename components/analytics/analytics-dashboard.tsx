'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import {
  Users, ClipboardList, CalendarCheck, TrendingUp,
  Download, Filter, RefreshCw, Award, AlertCircle
} from 'lucide-react'

const COLORS = ['#3b82f6', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#64748b']

type Division = { id: string; name: string; slug: string }

type AttendanceData = {
  byDivision: {
    divisionId: string; divisionName: string
    totalSessions: number; totalRecords: number
    hadirCount: number; izinCount: number; alphCount: number
  }[]
  monthly: { month: string; hadir: number; izin: number; alph: number }[]
  totalSessions: number
  totalRecords: number
}

type ProkerData = {
  statusDistribution: { name: string; value: number }[]
  byDivision: {
    divisionId: string; divisionName: string
    total: number; selesai: number; berjalan: number; rencana: number; dibatalkan: number
    taskTotal: number; taskSelesai: number
  }[]
  totalProker: number
  completionRate: number
}

type MemberData = {
  members: {
    id: string; name: string; division: string
    totalAttendance: number; hadirCount: number; hadirRate: number
    totalTasks: number; taskSelesai: number
    prokerLed: number; score: number
  }[]
}

export function AnalyticsDashboard({ divisions }: { divisions: Division[] }) {
  const [tab, setTab] = useState<'attendance' | 'proker' | 'members'>('attendance')
  const [attendance, setAttendance] = useState<AttendanceData | null>(null)
  const [proker, setProker] = useState<ProkerData | null>(null)
  const [members, setMembers] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(false)
  const [divisionId, setDivisionId] = useState('')
  const [exporting, setExporting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const qs = divisionId ? `?divisionId=${divisionId}` : ''

      if (tab === 'attendance') {
        const r = await fetch(`/api/analytics/attendance${qs}`)
        if (r.ok) setAttendance(await r.json())
      } else if (tab === 'proker') {
        const r = await fetch(`/api/analytics/proker${qs}`)
        if (r.ok) setProker(await r.json())
      } else {
        const r = await fetch(`/api/analytics/members${qs}`)
        if (r.ok) setMembers(await r.json())
      }
    } finally {
      setLoading(false)
    }
  }, [tab, divisionId])

  useEffect(() => { fetchData() }, [fetchData])

  const handleExport = async () => {
    try {
      setExporting(true)
      const typeMap = { attendance: 'attendance', proker: 'proker', members: 'members' }
      const qs = new URLSearchParams({ type: typeMap[tab] })
      if (divisionId) qs.set('divisionId', divisionId)

      const r = await fetch(`/api/analytics/export?${qs}`)
      if (!r.ok) throw new Error('Export gagal')
      const { rows, filename } = await r.json()

      // Dynamic import xlsx
      const XLSX = await import('xlsx')
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data')
      XLSX.writeFile(wb, filename)
    } catch (e) {
      console.error(e)
      alert('Export gagal, coba lagi')
    } finally {
      setExporting(false)
    }
  }

  const tabs = [
    { key: 'attendance' as const, label: 'Kehadiran', icon: CalendarCheck },
    { key: 'proker' as const, label: 'Proker', icon: ClipboardList },
    { key: 'members' as const, label: 'Keaktifan Anggota', icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border bg-background overflow-hidden">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={divisionId}
            onChange={e => setDivisionId(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">Semua Divisi</option>
            {divisions.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && tab === 'attendance' && attendance && (
        <AttendanceCharts data={attendance} />
      )}
      {!loading && tab === 'proker' && proker && (
        <ProkerCharts data={proker} />
      )}
      {!loading && tab === 'members' && members && (
        <MembersTable data={members} />
      )}
    </div>
  )
}

// ---- Attendance Charts ----
function AttendanceCharts({ data }: { data: AttendanceData }) {
  const hadirRate = data.totalRecords > 0
    ? Math.round((data.byDivision.reduce((s, d) => s + d.hadirCount, 0) / data.totalRecords) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Sesi" value={data.totalSessions} icon={CalendarCheck} color="blue" />
        <StatCard label="Total Presensi" value={data.totalRecords} icon={Users} color="cyan" />
        <StatCard label="Rate Hadir" value={`${hadirRate}%`} icon={TrendingUp} color="green" />
      </div>

      {/* Monthly trend */}
      {data.monthly.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Tren Kehadiran (12 Bulan)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" name="Hadir" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="izin" name="Izin" fill="#f59e0b" radius={[4,4,0,0]} />
              <Bar dataKey="alph" name="Alpha" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By division */}
      {data.byDivision.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Kehadiran per Divisi</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.byDivision} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="divisionName" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadirCount" name="Hadir" fill="#3b82f6" radius={[0,4,4,0]} />
              <Bar dataKey="izinCount" name="Izin" fill="#f59e0b" radius={[0,4,4,0]} />
              <Bar dataKey="alphCount" name="Alpha" fill="#ef4444" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ---- Proker Charts ----
function ProkerCharts({ data }: { data: ProkerData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Proker" value={data.totalProker} icon={ClipboardList} color="blue" />
        <StatCard label="Tingkat Selesai" value={`${data.completionRate}%`} icon={TrendingUp} color="green" />
        <StatCard
          label="Sedang Berjalan"
          value={data.statusDistribution.find(s => s.name === 'BERJALAN')?.value ?? 0}
          icon={RefreshCw}
          color="cyan"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie chart status distribution */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Distribusi Status Proker</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%" cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
                labelLine={false}
              >
                {data.statusDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Per division task completion */}
        <div className="rounded-xl border bg-card p-6">
          <h3 className="mb-4 font-semibold">Progress Task per Divisi</h3>
          <div className="space-y-3">
            {data.byDivision.map(d => {
              const pct = d.taskTotal > 0 ? Math.round((d.taskSelesai / d.taskTotal) * 100) : 0
              return (
                <div key={d.divisionId}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{d.divisionName}</span>
                    <span className="text-muted-foreground">{d.taskSelesai}/{d.taskTotal} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stacked bar per division */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="mb-4 font-semibold">Proker per Divisi</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.byDivision}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="divisionName" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="selesai" name="Selesai" fill="#10b981" stackId="a" />
            <Bar dataKey="berjalan" name="Berjalan" fill="#3b82f6" stackId="a" />
            <Bar dataKey="rencana" name="Rencana" fill="#94a3b8" stackId="a" />
            <Bar dataKey="dibatalkan" name="Dibatalkan" fill="#ef4444" stackId="a" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ---- Member Activity Table ----
function MembersTable({ data }: { data: MemberData }) {
  const [sort, setSort] = useState<'score' | 'hadirRate' | 'taskSelesai'>('score')
  const sorted = [...data.members].sort((a, b) => b[sort] - a[sort])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Urutkan:</span>
        {(['score', 'hadirRate', 'taskSelesai'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${sort === s ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}
          >
            {s === 'score' ? 'Skor Total' : s === 'hadirRate' ? 'Rate Hadir' : 'Task Selesai'}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <AlertCircle className="h-10 w-10" />
          <p>Belum ada data anggota</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Nama</th>
                <th className="px-4 py-3 text-left font-medium">Divisi</th>
                <th className="px-4 py-3 text-right font-medium">Hadir</th>
                <th className="px-4 py-3 text-right font-medium">Rate</th>
                <th className="px-4 py-3 text-right font-medium">Task</th>
                <th className="px-4 py-3 text-right font-medium">Skor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sorted.map((m, i) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    {i === 0 && <Award className="h-4 w-4 text-amber-500" />}
                    {i !== 0 && <span className="text-muted-foreground">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.division}</td>
                  <td className="px-4 py-3 text-right">{m.hadirCount}/{m.totalAttendance}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${m.hadirRate >= 80 ? 'text-green-600' : m.hadirRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {m.hadirRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{m.taskSelesai}/{m.totalTasks}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-primary">{m.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---- Shared Stat Card ----
function StatCard({
  label, value, icon: Icon, color
}: {
  label: string; value: string | number
  icon: React.ElementType; color: 'blue' | 'cyan' | 'green' | 'amber'
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="rounded-xl border bg-card p-5 flex items-start gap-4">
      <div className={`rounded-lg p-2.5 ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}
