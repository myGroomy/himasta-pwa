'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Terjadi Kesalahan</h2>
        <p className="text-slate-500">Maaf, terjadi masalah saat memuat halaman ini.</p>
        {error.message && (
          <p className="text-sm text-slate-400 font-mono">{error.message}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            Kembali ke Portal
          </Link>
        </Button>
        <Button variant="outline" onClick={() => reset()}>
          Coba Lagi
        </Button>
      </div>
    </div>
  )
}
