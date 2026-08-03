import type { NextRequest } from 'next/server'

type Entry = { count: number; resetAt: number }

// Rate limiter in-memory sederhana. Untuk multi-instance production,
// ganti dengan store terdistribusi (mis. Redis) — ponytail: upgrade saat
// deploy lebih dari satu instance di Vercel.
const buckets = new Map<string, Entry>()

const DEFAULTS = {
  limit: 60, // max request
  windowMs: 60_000, // per window 1 menit
}

export function rateLimit(
  req: NextRequest,
  opts: Partial<typeof DEFAULTS> = {}
): { ok: boolean; retryAfterSeconds: number; remaining: number } {
  const { limit, windowMs } = { ...DEFAULTS, ...opts }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${ip}:${req.nextUrl.pathname}`

  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0, remaining: limit - 1 }
  }

  entry.count += 1
  if (entry.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
      remaining: 0,
    }
  }

  return { ok: true, retryAfterSeconds: 0, remaining: limit - entry.count }
}

// Bersihkan bucket kedaluwarsa agar memori tidak membesar (dipanggil pada tiap request).
// Pakai forEach (bukan for..of) supaya tidak butuh downlevelIteration di tsconfig.
export function sweepExpired(now = Date.now()) {
  buckets.forEach((entry, key) => {
    if (entry.resetAt <= now) buckets.delete(key)
  })
  if (buckets.size > 10_000) buckets.clear() // safety valve
}
