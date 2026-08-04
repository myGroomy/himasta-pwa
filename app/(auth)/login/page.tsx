'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      identifier,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('NIM/email atau password salah. Pastikan akun Anda aktif.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Card className="shadow-2xl border-slate-200/80 rounded-3xl overflow-hidden">
      <CardHeader className="items-center text-center bg-slate-900 text-white pb-8 pt-8">
        <Link href="/welcome" className="self-start text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Halaman Utama
        </Link>

        <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-2xl bg-slate-800 p-2 shadow-inner border border-slate-700">
          <Image
            src="/himasta-logo.png"
            alt="Logo HIMASTA"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">HIMASTA</CardTitle>
        <CardDescription className="text-slate-400 text-xs mt-0.5">
          Sistem Informasi &amp; Operasional PWA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">NIM atau Email</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="misal: 22001 atau bph@himasta.id"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Belum punya akun?</span>{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar di sini
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-dashed bg-muted/50 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-semibold text-foreground">Akun demo (password: himasta123)</p>
          <p>• BPH: bph@himasta.id</p>
          <p>• Kadiv PSDM: kadiv.psdm@himasta.id</p>
          <p>• Anggota RION: anggota.rion@himasta.id</p>
          <p>• Dosen: dosen@himasta.id</p>
        </div>
      </CardContent>
    </Card>
  )
}
