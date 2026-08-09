'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

// CSS animation — tanpa framer-motion (50KB di tiap halaman via layout).
// Fade-in cepat, tidak blokir navigasi (tanpa exit/wait).
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="w-full h-full animate-in fade-in slide-in-from-bottom-1 duration-200"
    >
      {children}
    </div>
  )
}
