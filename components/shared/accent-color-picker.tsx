'use client'

import { useAccentTheme, AccentTheme } from './theme-provider'
import { useTheme } from 'next-themes'
import { Check, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

const THEMES: { id: AccentTheme; name: string; color: string }[] = [
  { id: 'noir', name: 'Klasik', color: 'bg-zinc-900' },
  { id: 'royal', name: 'Royal', color: 'bg-blue-600' },
  { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600' },
  { id: 'amethyst', name: 'Amethyst', color: 'bg-purple-700' },
]

export function AccentColorPicker() {
  const { theme: accent, setTheme: setAccent } = useAccentTheme()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-20 w-full animate-pulse bg-muted rounded-xl" />
  }

  const isDark = theme === 'dark'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-[#EAEAEA] bg-background p-3 shadow-sm transition-all hover:border-foreground/30">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Mode Gelap</span>
          <span className="text-xs text-muted-foreground">Tampilan akan disesuaikan dengan cahaya redup</span>
        </div>
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="absolute inset-0 m-1 flex justify-between px-1.5 py-1">
            <Moon className="h-4 w-4 text-slate-400" />
            <Sun className="h-4 w-4 text-yellow-500" />
          </div>
          <div
            className={`absolute z-10 flex h-7 w-7 transform items-center justify-center rounded-full bg-background shadow-md ring-1 ring-black/5 transition-transform ${
              isDark ? 'translate-x-3.5' : '-translate-x-3.5'
            }`}
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </div>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setAccent(t.id)}
            className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all hover:border-foreground/30 ${
              accent === t.id ? 'border-primary ring-1 ring-primary shadow-sm bg-secondary/20' : 'border-[#EAEAEA] bg-background'
            }`}
          >
            <div className={`h-8 w-8 rounded-full shadow-sm ${t.color} flex items-center justify-center`}>
              {accent === t.id && <Check className="h-4 w-4 text-white" />}
            </div>
            <span className="text-xs font-medium text-foreground">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
