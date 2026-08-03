import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/use-toast'
import { ServiceWorkerRegistration } from '@/components/shared/service-worker-registration'

const APP_NAME = 'HIMASTA'
const APP_DESCRIPTION =
  'Sistem informasi dan operasional resmi Himpunan Mahasiswa Sains Data — portal pengumuman, absensi QR, dan arsip dokumen.'

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Sistem Informasi & Operasional`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  applicationName: APP_NAME,
  authors: [{ name: 'HIMASTA' }],
  keywords: ['HIMASTA', 'Himpunan Mahasiswa Sains Data', 'organisasi', 'absensi QR', 'pengumuman'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXTAUTH_URL ?? 'https://himasta.example.com',
    siteName: APP_NAME,
    title: `${APP_NAME} — Sistem Informasi & Operasional`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: `${APP_NAME} — Sistem Informasi & Operasional`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: false, // internal tool — tidak perlu diindeks mesin pencari
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
}

export const viewport: Viewport = {
  themeColor: '#4338CA',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
