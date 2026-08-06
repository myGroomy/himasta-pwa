'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const ROUTE_PARENTS: Record<string, string> = {
  '/proker/new': '/proker',
  '/proker': '/',
  '/announcements/new': '/announcements',
  '/announcements': '/',
  '/events/new': '/events',
  '/events': '/',
  '/kegiatan/scan': '/kegiatan',
  '/kegiatan': '/',
  '/izin': '/',
  '/kalender': '/',
  '/profil': '/',
  '/dokumen': '/',
  '/direktori': '/',
  '/piket': '/',
  '/notifikasi': '/',
  '/feedback': '/',
  '/login': '/welcome',
  '/register': '/welcome',
  '/forgot-password': '/login',
}

function getParentRoute(pathname: string): string | null {
  // Exact match
  if (ROUTE_PARENTS[pathname] !== undefined) {
    return ROUTE_PARENTS[pathname]
  }

  // Dynamic route matches
  if (/^\/events\/[^\/]+$/.test(pathname)) {
    return '/events'
  }
  if (/^\/announcements\/[^\/]+$/.test(pathname)) {
    return '/announcements'
  }
  if (/^\/announcements\/[^\/]+\/edit$/.test(pathname)) {
    return '/announcements'
  }
  if (/^\/divisi\/[^\/]+$/.test(pathname)) {
    return '/'
  }

  return null
}

export function HierarchicalNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // If not at the root page, we intercept state so back goes to parent
    const parent = getParentRoute(pathname)
    if (!parent) return

    // Push dummy state to capture next back gesture
    window.history.pushState({ type: 'hierarchical' }, '')

    const handlePopState = (event: PopStateEvent) => {
      // Intercepted: Go to parent path instead of back in browser history
      router.push(parent)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, router])

  return null
}
