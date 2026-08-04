import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/', '/login', '/welcome']
const PUBLIC_API_PATHS = ['/api/events/register-external'] // form pendaftaran tanpa akun
const API_AUTH_PREFIX = '/api/auth'

// Security headers diterapkan ke semua response kecuali API (untuk menghindari
// konflik dengan cache headers). CSP dikecualikan ke header tambahan karena
// aplikasi memakai inline script dari Next.js.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(self), microphone=(), geolocation=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Enforce HTTPS (kecuali saat dev di localhost)
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.get('x-forwarded-proto') === 'http' &&
    req.nextUrl.hostname !== 'localhost'
  ) {
    const httpsUrl = req.nextUrl.clone()
    httpsUrl.protocol = 'https'
    return NextResponse.redirect(httpsUrl, 308)
  }

  // API: jangan tambahkan security headers (bisa bertabrakan dengan caching),
  // tapi tetap enforce auth.
  const isPublicEventPath = /^\/events\/[^/]+$/.test(pathname)
  const isPublicEventApi = /^\/api\/events\/[^/]+\/register$/.test(pathname)

  if (
    pathname.startsWith(API_AUTH_PREFIX) ||
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_API_PATHS.includes(pathname) ||
    isPublicEventPath ||
    isPublicEventApi
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req })

  const response = NextResponse.next()
  Object.entries(SECURITY_HEADERS).forEach(([k, v]) => response.headers.set(k, v))

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    if (pathname.startsWith('/api')) {
      const apiRes = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      Object.entries(SECURITY_HEADERS).forEach(([k, v]) => apiRes.headers.set(k, v))
      return apiRes
    }
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/welcome',
    '/announcements/:path*',
    '/absensi/:path*',
    '/dokumen/:path*',
    '/direktori/:path*',
    '/divisi/:path*',
    '/proker/:path*',
    '/izin/:path*',
    '/events/:path*',
    '/kalender/:path*',
    '/admin/:path*',
    '/notifikasi/:path*',
    '/api/announcements/:path*',
    '/api/attendance/:path*',
    '/api/documents/:path*',
    '/api/divisions/:path*',
    '/api/users/:path*',
    '/api/notifications/:path*',
    '/api/approval-logs/:path*',
    '/api/prokers/:path*',
    '/api/tasks/:path*',
    '/api/permissions/:path*',
    '/api/events/:path*',
  ],
}
