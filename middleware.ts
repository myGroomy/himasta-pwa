import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = ['/login']
const API_AUTH_PREFIX = '/api/auth'

// Security headers — diterapkan ke semua response kecuali API (untuk menghindari
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
  if (pathname.startsWith(API_AUTH_PREFIX) || PUBLIC_PATHS.includes(pathname)) {
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
    '/announcements/:path*',
    '/absensi/:path*',
    '/dokumen/:path*',
    '/direktori/:path*',
    '/divisi/:path*',
    '/admin/:path*',
    '/notifikasi/:path*',
    '/api/announcements/:path*',
    '/api/attendance/:path*',
    '/api/documents/:path*',
    '/api/divisions/:path*',
    '/api/users/:path*',
    '/api/notifications/:path*',
    '/api/approval-logs/:path*',
  ],
}
