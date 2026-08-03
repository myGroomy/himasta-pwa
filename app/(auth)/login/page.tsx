'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react'
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
    <Card className="shadow-lg">
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow">
          <GraduationCap className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl">HIMASTA</CardTitle>
        <CardDescription>Masuk ke Sistem Informasi & Operasional</CardDescription>
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
