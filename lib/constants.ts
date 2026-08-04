import type {
  Role,
  AnnouncementScope,
  AnnouncementStatus,
  DocumentCategory,
  ProkerStatus,
  TaskStatus,
  PermissionStatus,
  EventStatus,
  EventVisibility,
  AttendanceStatus,
  KegiatanCategory,
} from '@prisma/client'

export const ROLE_LABELS: Record<Role, string> = {
  ANGGOTA: 'Anggota',
  KADIV: 'Kadiv',
  BPH: 'BPH',
  DOSEN: 'Dosen',
}

export const SCOPE_LABELS: Record<AnnouncementScope, string> = {
  GENERAL: 'General',
  DIVISION: 'Divisi',
}

export const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  DRAFT: 'Draf',
  PENDING_APPROVAL: 'Menunggu Approval',
  PUBLISHED: 'Tayang',
  REJECTED: 'Ditolak',
}

export const DOC_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  NOTULEN: 'Notulen',
  PROPOSAL: 'Proposal',
  LPJ: 'LPJ',
  LAINNYA: 'Lainnya',
}

export const DOC_CATEGORY_BADGE: Record<DocumentCategory, string> = {
  NOTULEN: 'bg-pastel-blue text-pastel-blue-foreground border border-[#EAEAEA]',
  PROPOSAL: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  LPJ: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
  LAINNYA: 'bg-secondary text-foreground border border-[#EAEAEA]',
}

export const PROKER_STATUS_LABELS: Record<ProkerStatus, string> = {
  RENCANA: 'Rencana',
  BERJALAN: 'Berjalan',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
}

export const PROKER_STATUS_BADGE: Record<ProkerStatus, string> = {
  RENCANA: 'bg-pastel-blue text-pastel-blue-foreground border border-[#EAEAEA]',
  BERJALAN: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  SELESAI: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
  DIBATALKAN: 'bg-secondary text-muted-foreground border border-[#EAEAEA]',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BELUM: 'Belum',
  BERJALAN: 'Berjalan',
  SELESAI: 'Selesai',
}

export const TASK_STATUS_BADGE: Record<TaskStatus, string> = {
  BELUM: 'bg-secondary text-muted-foreground border border-[#EAEAEA]',
  BERJALAN: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  SELESAI: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
}

export const PERMISSION_STATUS_LABELS: Record<PermissionStatus, string> = {
  PENDING: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
}

export const PERMISSION_STATUS_BADGE: Record<PermissionStatus, string> = {
  PENDING: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  DISETUJUI: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
  DITOLAK: 'bg-pastel-red text-pastel-red-foreground border border-[#EAEAEA]',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Draf',
  PENDING_APPROVAL: 'Menunggu Approval',
  PUBLISHED: 'Tayang',
  REJECTED: 'Ditolak',
}

export const EVENT_STATUS_BADGE: Record<EventStatus, string> = {
  DRAFT: 'bg-secondary text-muted-foreground border border-[#EAEAEA]',
  PENDING_APPROVAL: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  PUBLISHED: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
  REJECTED: 'bg-pastel-red text-pastel-red-foreground border border-[#EAEAEA]',
}

export const EVENT_VISIBILITY_LABELS: Record<EventVisibility, string> = {
  INTERNAL: 'Internal',
  PUBLIC: 'Publik',
}

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  HADIR: 'Hadir',
  IZIN: 'Izin',
  TANPA_KETERANGAN: 'Tanpa Keterangan',
}

export const ATTENDANCE_STATUS_BADGE: Record<AttendanceStatus, string> = {
  HADIR: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
  IZIN: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  TANPA_KETERANGAN: 'bg-pastel-red text-pastel-red-foreground border border-[#EAEAEA]',
}

export const KEGIATAN_CATEGORY_LABELS: Record<KegiatanCategory, string> = {
  RAPAT: 'Rapat',
  MAKRAB: 'Makrab',
  MUBES: 'Mubes',
  PROKER: 'Proker',
  LAINNYA: 'Lainnya',
}

export const KEGIATAN_CATEGORY_BADGE: Record<KegiatanCategory, string> = {
  RAPAT: 'bg-pastel-blue text-pastel-blue-foreground border border-[#EAEAEA]',
  MAKRAB: 'bg-pastel-green text-pastel-green-foreground border border-[#EAEAEA]',
  MUBES: 'bg-pastel-yellow text-pastel-yellow-foreground border border-[#EAEAEA]',
  PROKER: 'bg-pastel-red text-pastel-red-foreground border border-[#EAEAEA]',
  LAINNYA: 'bg-secondary text-muted-foreground border border-[#EAEAEA]',
}
