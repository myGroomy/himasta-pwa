'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

type RegisterFormProps = {
  divisions: { id: string; name: string; slug: string }[]
}

export function RegisterForm({ divisions }: RegisterFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    nim: '',
    password: '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
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
        nim: form.nim || null,
        divisionId: null,
      }),
    })
    
    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      toast({ title: 'Gagal mendaftar', description: data?.error || 'Terjadi kesalahan', variant: 'destructive' })
      return
    }

    toast({
      title: 'Pendaftaran Berhasil',
      description: 'Akun Anda telah dibuat dan sedang menunggu persetujuan BPH.',
      variant: 'success',
    })
    
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-name">Nama Lengkap</Label>
        <Input id="reg-name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input id="reg-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-nim">NIM (opsional)</Label>
        <Input id="reg-nim" value={form.nim} onChange={(e) => set('nim', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-pw">Password</Label>
        <div className="relative">
          <Input
            id="reg-pw"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            required
            className="pr-10"
            minLength={6}
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

      <Button type="submit" className="w-full mt-4" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Daftar Sekarang
      </Button>
    </form>
  )
}
