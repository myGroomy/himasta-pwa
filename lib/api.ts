import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, type SessionUser } from '@/lib/auth'
import { rateLimit, sweepExpired } from '@/lib/rate-limit'
import type { Role } from '@prisma/client'

export async function getApiSession(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions)
  return session?.user ? (session.user as SessionUser) : null
}

export function unauthorized(message = 'Anda tidak memiliki akses') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Akses ditolak') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = 'Data tidak ditemukan') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverError(error?: unknown) {
  console.error(error)
  return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
}

export async function requireApiSession(roles?: Role[]): Promise<SessionUser | NextResponse> {
  const user = await getApiSession()
  if (!user) return unauthorized()
  if (roles && !roles.includes(user.role)) return forbidden()
  return user
}

export function isApiResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}

export function tooManyRequests(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: 'Terlalu banyak permintaan. Coba lagi beberapa saat.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
  )
}

// Terapkan ke endpoint sensitif (mutasi) untuk mencegah abuse.
// Memakai bucket in-memory per-IP+path.
export function rateLimited(req: NextRequest, opts?: { limit?: number; windowMs?: number }) {
  sweepExpired()
  const result = rateLimit(req, opts)
  if (!result.ok) return tooManyRequests(result.retryAfterSeconds)
  return null
}
