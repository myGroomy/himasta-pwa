import Image from 'next/image'
import Link from 'next/link'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { ROLE_LABELS } from '@/lib/constants'
import {
  User, ShieldCheck, Mail, Phone, QrCode,
  Calendar, Award, CheckCircle2, History, Building2, LogOut,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { ProfileActions } from '@/components/shared/profile-actions'
import { QrSayaButton } from '@/components/shared/qr-saya-button'
import { KtaActions } from '@/components/shared/kta-actions'
import { PermissionsSettings } from '@/components/shared/permissions-settings'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Profil Saya | HIMASTA',
  description: 'Kartu Anggota Digital & Profil Peserta HIMASTA',
}

export default async function ProfilPage() {
  const user = await requireSession()

  const [dbUser, memberHistories, attendanceCount, tasksCount, registrations] = await Promise.all([
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
    prisma.eventRegistration.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startTime: true,
            division: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  ])

  if (!dbUser) return null

  const initials = dbUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-12 px-4 md:px-0">
      {/* Digital Member Card - Realistic Corporate Plastic ID Card */}
      <div 
        id="member-card" 
        className="relative overflow-hidden rounded-xl bg-white text-slate-800 shadow-md border-2 border-slate-200 aspect-[1.586/1] w-full flex flex-col font-sans"
        style={{ contentVisibility: 'auto' }}
      >
        {/* Header Band */}
        <div className="bg-[#00236f] text-white px-4 py-3 flex items-center justify-between border-b border-[#00164e]">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 bg-white rounded-md p-1">
              <Image
                src="/himasta-logo.webp"
                alt="Logo HIMASTA"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-extrabold tracking-wider leading-none text-white">HIMASTA</p>
              <p className="text-[8px] font-semibold text-white/80 leading-none mt-1">HIMPUNAN MAHASISWA STATISTIKA</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-white/20 hover:bg-white/20 text-white border-0 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5">
              {ROLE_LABELS[dbUser.role as keyof typeof ROLE_LABELS]}
            </Badge>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex-1 p-4 grid grid-cols-12 gap-4 items-center bg-slate-50/50">
          {/* Left Column: Photo & Barcode */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            {/* Photo Box */}
            <div className="relative h-24 w-20 shrink-0 border-2 border-slate-300 bg-slate-100 rounded shadow-sm overflow-hidden flex items-center justify-center">
              {dbUser.photoUrl ? (
                <Image src={dbUser.photoUrl} alt={dbUser.name} fill className="object-cover" />
              ) : (
                <span className="text-2xl font-bold text-slate-400">{initials}</span>
              )}
            </div>
            
            {/* Real Barcode Design */}
            <div className="mt-2.5 w-full flex flex-col items-center">
              <div className="h-6 w-full flex items-center justify-center gap-[1px] bg-white border border-slate-200 px-1 rounded" aria-hidden="true">
                {[1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 1, 2, 1, 3, 1].map((w, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-900 h-4" 
                    style={{ width: `${w}px` }} 
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-slate-500 mt-0.5 tracking-widest">
                {dbUser.nim ?? 'HIMASTA-MEMBER'}
              </span>
            </div>
          </div>

          {/* Right Column: Member Details */}
          <div className="col-span-8 space-y-2 text-left">
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</span>
              <h2 className="text-base font-extrabold text-slate-800 leading-tight line-clamp-1">{dbUser.name}</h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Induk Mahasiswa</span>
                <p className="text-[11px] font-semibold text-slate-700 font-mono">{dbUser.nim ?? '—'}</p>
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Status Keanggotaan</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AKTIF
                </span>
              </div>
            </div>

            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Divisi Kepengurusan</span>
              <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                {dbUser.division?.name ?? 'BPH / Umum'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Band */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5 flex items-center justify-between text-[8px] font-semibold text-slate-500">
          <span>KARTU IDENTITAS RESMI</span>
          <span>MASA BERLAKU: 2026/2027</span>
        </div>
      </div>

      {/* Unduh KTA sebagai Gambar */}
      <KtaActions />

      <ProfileActions
        initialPhone={dbUser.phone || ''}
        initialPhotoUrl={dbUser.photoUrl || ''}
        registrations={registrations as any}
      />

      {/* Perizinan & Notifikasi */}
      <PermissionsSettings />

      <div className="grid grid-cols-2 gap-3">
        <QrSayaButton className="w-full h-11" />
      </div>

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
