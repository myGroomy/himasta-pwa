'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Kontrol back (system/browser) ala PWA:
 * - Di halaman dalam mana pun → back menuju dashboard ('/').
 * - Sudah di dashboard → back keluar dari app (tidak pernah kembali
 *   ke halaman dalam sesuai histori).
 *
 * Cara kerja: setiap halaman dalam menaruh 1 entry dummy (URL sama) di
 * history. Back pertama pop entry dummy → URL tidak berubah → Next tidak
 * menavigasi → kita arahkan sendiri. Di dashboard, back diteruskan
 * (history.back()) beruntun sampai melewati semua entry app → keluar.
 */
export function HierarchicalNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const pathRef = useRef(pathname)

  useEffect(() => {
    pathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    // Entry dummy: back berikutnya pop entry ini (URL sama) → Next diam,
    // hanya handler kita yang jalan.
    window.history.pushState({ himastaNav: true }, '')

    const handlePopState = () => {
      if (pathRef.current === '/') {
        // Dashboard: lanjutkan back → pop semua entry app → keluar app.
        window.history.back()
      } else {
        // Halaman dalam: back → dashboard (replace, tanpa entry baru).
        router.replace('/')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [pathname, router])

  return null
}
