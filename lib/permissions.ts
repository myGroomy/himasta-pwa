import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions, type SessionUser } from '@/lib/auth'
import type { Role } from '@prisma/client'

export async function requireSession(): Promise<SessionUser> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  return session.user as SessionUser
}

export async function getOptionalSession() {
  const session = await getServerSession(authOptions)
  return session?.user ? (session.user as SessionUser) : null
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireSession()
  if (!roles.includes(user.role)) redirect('/')
  return user
}

export const canManageDivision = (user: SessionUser, divisionId?: string | null) =>
  user.role === 'BPH' || (user.role === 'KADIV' && !!divisionId && user.divisionId === divisionId)

export const canCreateGeneralAnnouncement = (user: SessionUser) =>
  user.role === 'BPH' || user.role === 'KADIV'

export const canGenerateQr = (user: SessionUser) => user.role === 'BPH' || user.role === 'KADIV'

export const isBPH = (user: SessionUser) => user.role === 'BPH'

export const isAdmin = (user: SessionUser) => user.role === 'BPH'
