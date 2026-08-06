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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nama Lengkap */}
      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="nama">
          NAMA LENGKAP
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="nama"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Masukkan nama lengkap"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#001035] text-white placeholder:text-slate-500 focus:border-white/40 focus:ring-0 transition-colors min-h-[48px] text-sm rounded"
          />
        </div>
      </div>

      {/* NIM */}
      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="nim">
          NIM
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
            className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#001035] text-white placeholder:text-slate-500 focus:border-white/40 focus:ring-0 transition-colors min-h-[48px] text-sm rounded"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="email">
          EMAIL
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
            placeholder="contoh@mahasiswa.edu"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#001035] text-white placeholder:text-slate-500 focus:border-white/40 focus:ring-0 transition-colors min-h-[48px] text-sm rounded"
          />
        </div>
      </div>

      {/* No. HP */}
      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="phone">
          NO. HP / WHATSAPP
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Phone className="h-4 w-4" />
          </div>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            required
            placeholder="08xxxxxxxxxx"
            className="block w-full pl-10 pr-3 py-3 border border-white/10 bg-[#001035] text-white placeholder:text-slate-500 focus:border-white/40 focus:ring-0 transition-colors min-h-[48px] text-sm rounded"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5 text-left">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-300" htmlFor="password">
          PASSWORD
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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

      {/* Action Button */}
      <Button
        type="submit"
        className="w-full bg-white hover:bg-slate-100 text-[#001035] font-bold py-3 px-4 rounded transition-colors min-h-[48px] flex justify-center items-center mt-2 border-0"
        disabled={loading}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Daftar
      </Button>
    </form>
  )
}
