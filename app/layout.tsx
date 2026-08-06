import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/use-toast'
import { ServiceWorkerRegistration } from '@/components/shared/service-worker-registration'

const APP_NAME = 'HIMASTA'
const APP_DESCRIPTION =
  'Sistem informasi dan operasional resmi Himpunan Mahasiswa Sains Data portal pengumuman, absensi QR, dan arsip dokumen.'

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} Sistem Informasi & Operasional`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  icons: {
    icon: '/himasta-logo.png',
    apple: '/himasta-logo.png',
  },
  applicationName: APP_NAME,
  authors: [{ name: 'HIMASTA' }],
  keywords: ['HIMASTA', 'Himpunan Mahasiswa Sains Data', 'organisasi', 'absensi QR', 'pengumuman'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXTAUTH_URL ?? 'https://himasta.example.com',
    siteName: APP_NAME,
    title: `${APP_NAME} Sistem Informasi & Operasional`,
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: `${APP_NAME} Sistem Informasi & Operasional`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: false, // internal tool tidak perlu diindeks mesin pencari
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
}

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
}

import { ThemeProviderWrapper } from '@/components/shared/theme-provider-wrapper'
import { Outfit } from 'next/font/google'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={cn("antialiased font-sans", outfit.variable)}>
        <ThemeProviderWrapper attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
