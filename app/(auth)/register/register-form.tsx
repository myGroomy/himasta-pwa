'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, User, Mail, ShieldAlert, Phone, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    nim: '',
    phone: '',
    password: '',
  })

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        divisionId: null,
      }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      toast({
        title: 'Gagal Mendaftar',
        description: data?.error ?? 'Terjadi kesalahan sistem',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Pendaftaran Berhasil',
      description: 'Akun Anda telah dibuat dan sedang menunggu persetujuan HIMASTA.',
      variant: 'success',
    })

    router.push('/login')
  }

  const fieldClass = 'pl-9 h-10'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-sm font-medium text-foreground" htmlFor="nama">
          Nama Lengkap
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="nama"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Masukkan nama lengkap"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-sm font-medium text-foreground" htmlFor="nim">
          NIM
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <Input
            id="nim"
            value={form.nim}
            onChange={(e) => set('nim', e.target.value)}
            required
            minLength={10}
            maxLength={10}
            placeholder="Masukkan NIM Anda"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            placeholder="contoh@mahasiswa.edu"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-sm font-medium text-foreground" htmlFor="phone">
          No. HP / WhatsApp
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Phone className="h-4 w-4" />
          </div>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            required
            placeholder="08xxxxxxxxxx"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan Password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required
            minLength={6}
            className="pl-9 pr-10 h-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-10 font-semibold"
        disabled={loading}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Daftar
      </Button>
    </form>
  )
}
