/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  optimizeFonts: false,
  allowedDevOrigins: ['himasta.livowear.my.id'],
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

module.exports = nextConfig
