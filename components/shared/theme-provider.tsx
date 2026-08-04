'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type AccentTheme = 'noir' | 'royal' | 'emerald'

interface AccentThemeContextType {
  theme: AccentTheme
  setTheme: (theme: AccentTheme) => void
}

const AccentThemeContext = createContext<AccentThemeContextType>({
  theme: 'noir',
  setTheme: () => null,
})

const themeStyles: Record<AccentTheme, { primary: string; primaryForeground: string; ring: string }> = {
  noir: {
    primary: '0 0% 7%',
    primaryForeground: '0 0% 100%',
    ring: '0 0% 7%',
  },
  royal: {
    primary: '221 83% 53%', // #1d4ed8
    primaryForeground: '0 0% 100%',
    ring: '221 83% 53%',
  },
  emerald: {
    primary: '158 64% 39%', // #10b981
    primaryForeground: '0 0% 100%',
    ring: '158 64% 39%',
  },
}

import { useTheme } from 'next-themes'

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AccentTheme>('noir')
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const saved = localStorage.getItem('himasta-accent-theme') as AccentTheme | null
    if (saved && themeStyles[saved]) {
      setThemeState(saved)
    }
    setMounted(true)
  }, [])

  const setTheme = (newTheme: AccentTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('himasta-accent-theme', newTheme)
  }

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    
    // Copy the style so we can modify it for dark mode if needed
    const style = { ...themeStyles[theme] }
    
    // If using the classic Noir theme, we need to invert the primary color in dark mode
    // so that buttons don't become black on a dark gray background.
    if (theme === 'noir' && resolvedTheme === 'dark') {
      style.primary = '0 0% 96%' // Soft white
      style.primaryForeground = '0 0% 9%' // Dark text
      style.ring = '0 0% 96%'
    }
    
    // Inject CSS variables
    root.style.setProperty('--primary', style.primary)
    root.style.setProperty('--primary-foreground', style.primaryForeground)
    root.style.setProperty('--ring', style.ring)
  }, [theme, mounted, resolvedTheme])

  // Prevent flash by wrapping in a minimal script? Next.js might still flash on initial SSR.
  // Tapi untuk use case ini, cukup jalankan effect secepatnya.

  return (
    <AccentThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </AccentThemeContext.Provider>
  )
}

export const useAccentTheme = () => useContext(AccentThemeContext)
