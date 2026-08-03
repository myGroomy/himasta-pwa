import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', opts ?? { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  const intervals: [number, string][] = [
    [31536000, 'tahun'],
    [2592000, 'bulan'],
    [604800, 'minggu'],
    [86400, 'hari'],
    [3600, 'jam'],
    [60, 'menit'],
  ]
  for (const [secondsIn, unit] of intervals) {
    const value = Math.floor(seconds / secondsIn)
    if (value >= 1) return `${value} ${unit} lalu`
  }
  return 'baru saja'
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
