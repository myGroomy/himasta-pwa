import Image from 'next/image'
import Link from 'next/link'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { ROLE_LABELS } from '@/lib/constants'
import {
  User, ShieldCheck, Mail, Phone, QrCode,
  Calendar, Award, CheckCircle2, History, Building2, LogOut, Palette
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AccentColorPicker } from '@/components/shared/accent-color-picker'

import { ProfileActions } from '@/components/shared/profile-actions'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profil Saya | HIMASTA',
  description: 'Kartu Anggota Digital & Profil Peserta HIMASTA',
}

export default async function ProfilPage() {
  const user = await requireSession()

  const [dbUser, memberHistories, attendanceCount, tasksCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      include: {
        division: true,
      },
    }),
    prisma.memberHistory.findMany({
      where: { userId: user.id },
      include: { period: true },
      orderBy: { joinedAt: 'desc' },
    }),
    prisma.attendanceRecord.count({ where: { userId: user.id, status: 'HADIR' } }),
    prisma.task.count({ where: { assigneeId: user.id, status: 'SELESAI' } }),
  ])

  if (!dbUser) return null

  const initials = dbUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-12">
      {/* Digital Member Card */}
      <div id="member-card" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 p-6 text-white shadow-2xl border border-slate-700">
        <div className="absolute right-0 top-0 -mr-8 -mt-8 h-40 w-40 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-800/80 border border-slate-700 p-1">
              <Image
                src="/himasta-logo.png"
                alt="Logo HIMASTA"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">KARTU ANGGOTA DIGITAL</p>
              <p className="text-base font-extrabold tracking-tight">HIMASTA</p>
            </div>
          </div>
          <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs">
            {ROLE_LABELS[dbUser.role]}
          </Badge>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-xl font-black text-white shadow-md relative overflow-hidden">
            {dbUser.image ? (
              <Image src={dbUser.image} alt={dbUser.name} fill className="object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">{dbUser.name}</h2>
            <p className="text-sm text-slate-300 mt-0.5 font-mono">NIM: {dbUser.nim ?? '—'}</p>
            <p className="text-xs text-sky-400 mt-1 flex items-center gap-1 font-medium">
              <Building2 className="h-3 w-3" />
              Divisi: {dbUser.division?.name ?? 'BPH / Umum'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-700/60 pt-4 text-xs text-slate-300">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Status Keanggotaan</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="h-3 w-3" /> Aktif
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Email Terdaftar</span>
            <span className="font-mono text-slate-200">{dbUser.email}</span>
          </div>
        </div>
      </div>

      <ProfileActions 
        initialPhone={dbUser.phone || ''}
        initialPhotoUrl={dbUser.image || ''}
      />

      {/* Quick Performance Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 flex items-center gap-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Presensi</p>
            <p className="text-xl font-bold">{attendanceCount} <span className="text-xs font-normal">Hadir</span></p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 flex items-center gap-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Task Selesai</p>
            <p className="text-xl font-bold">{tasksCount} <span className="text-xs font-normal">Tugas</span></p>
          </div>
        </div>
      </div>

      {/* Detail Informasi */}
      <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Informasi Kontak
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
            <span className="font-medium">{dbUser.email}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> WhatsApp / HP
            </span>
            <span className="font-medium">{dbUser.phone ?? 'Belum diisi'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Jabatan Organisasi
            </span>
            <span className="font-medium text-primary">{ROLE_LABELS[dbUser.role]}</span>
          </div>
        </div>
      </div>

      {/* Tampilan & Personalisasi */}
      <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          Tema & Personalisasi
        </h3>
        <AccentColorPicker />
      </div>

      {/* Riwayat Jabatan */}
      {memberHistories.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Riwayat Jabatan Organisasi
          </h3>
          <div className="space-y-2">
            {memberHistories.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  <p className="font-medium">{h.period.name}</p>
                  <p className="text-xs text-muted-foreground">Status: {h.status}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {ROLE_LABELS[h.role]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
