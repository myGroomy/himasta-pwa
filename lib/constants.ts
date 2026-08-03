import type { Role, AnnouncementScope, AnnouncementStatus, DocumentCategory } from '@prisma/client'

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
  NOTULEN: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-violet-100 text-violet-800',
  LPJ: 'bg-emerald-100 text-emerald-800',
  LAINNYA: 'bg-slate-100 text-slate-700',
}
