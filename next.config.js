/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  optimizeFonts: false,
  allowedDevOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [new URL(process.env.NEXT_PUBLIC_APP_URL).host]
    : [],
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/absensi/scan', destination: '/kegiatan/scan', permanent: true },
      { source: '/absensi', destination: '/kegiatan', permanent: true },
    ]
  },
}

module.exports = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  scope: '/',
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      // Data API (termasuk auth/session) — SELALU fresh, jangan pernah di-cache
      {
        urlPattern: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith('/api/'),
        handler: 'NetworkOnly',
        method: 'GET',
        options: { cacheName: 'apis' },
      },
      // RSC payload halaman (isi force-dynamic) — network-first, cache hanya utk fallback offline
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: 'NetworkFirst',
        method: 'GET',
        options: {
          cacheName: 'next-data',
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
        },
      },
    ],
  },
})(nextConfig)
