'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, School, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      setError(
        'Email atau password salah. Jika baru mendaftar, akun Anda mungkin masih menunggu persetujuan.'
      )
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-[#001035] text-white">
      <div className="w-full max-w-sm mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center flex flex-col items-center">
          {/* Logo Placeholder */}
          <div className="w-16 h-16 bg-white/10 rounded border border-white/20 flex items-center justify-center mb-6">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Masuk ke akun Anda
          </h1>
          <p className="text-xs text-slate-300">
            Gunakan NIM atau Email kepengurusan HIMASTA
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-[#001c55] border border-white/10 p-6 rounded shadow-lg space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIM / Email */}
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="identifier">
                NIM / Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Masukkan NIM atau Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#001035] text-white placeholder:text-slate-500 focus:border-white/40 focus:ring-0 transition-colors min-h-[48px] text-sm rounded"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="password">
                  Password
                </Label>
                <Link href="/forgot-password" className="text-xs font-semibold text-white/80 hover:text-white hover:underline">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-white/10 bg-[#001035] text-white placeholder:text-slate-500 focus:border-white/40 focus:ring-0 transition-colors min-h-[48px] text-sm rounded"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded bg-red-500/20 px-3 py-2 text-xs text-red-200 text-left leading-relaxed border border-red-500/30">
                {error}
              </p>
            )}

            {/* Action Button */}
            <Button
              type="submit"
              className="w-full bg-white hover:bg-slate-100 text-[#001035] font-bold py-3 px-4 rounded transition-colors min-h-[48px] flex justify-center items-center mt-2 border-0"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Masuk
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10">
            Belum punya akun?{' '}
            <Link href="/register" className="font-bold text-white hover:underline">
              Daftar disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
