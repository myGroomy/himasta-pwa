import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions, type SessionUser } from '@/lib/auth'
import type { Role } from '@prisma/client'
import type { Session } from 'next-auth'

export async function requireSession(): Promise<SessionUser> {
  let session: Session | null = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    session = null
  }
  if (!session?.user?.id) redirect('/login')
  return session.user as SessionUser
}

export async function getOptionalSession() {
  try {
    const session = await getServerSession(authOptions)
    return session?.user ? (session.user as SessionUser) : null
  } catch {
    return null
  }
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireSession()
  if (!roles.includes(user.role)) redirect('/')
  return user
}

export const canManageDivision = (user: SessionUser, divisionId?: string | null) =>
  user.role === 'BPH' || (user.role === 'KADIV' && !!divisionId && user.divisionId === divisionId)

// --- V2 ---

// Kadiv bisa kelola proker & approval izin di divisi sendiri; BPH lintas divisi
export const canManageProker = (user: SessionUser, divisionId?: string | null) =>
  user.role === 'BPH' || (user.role === 'KADIV' && !!divisionId && user.divisionId === divisionId)

export const canApprovePermission = (user: SessionUser, requesterDivisionId?: string | null) =>
  user.role === 'BPH' ||
  (user.role === 'KADIV' && !!requesterDivisionId && user.divisionId === requesterDivisionId)

// Event publik divisi butuh approval BPH; event BPH/general & internal divisi tayang langsung
export const eventNeedsApproval = (user: SessionUser, visibility: 'INTERNAL' | 'PUBLIC') =>
  user.role !== 'BPH' && visibility === 'PUBLIC'
