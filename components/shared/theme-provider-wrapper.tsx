'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'
import { AccentThemeProvider } from './theme-provider'

export function ThemeProviderWrapper({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <AccentThemeProvider>{children}</AccentThemeProvider>
    </NextThemesProvider>
  )
}
