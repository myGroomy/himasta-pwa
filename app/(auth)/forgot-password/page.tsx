'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Simulasi request API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setLoading(false)
    toast({
      title: 'Tautan Terkirim',
      description: 'Jika email Anda terdaftar, tautan pemulihan telah dikirim.',
      variant: 'success',
    })
  }

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke login
        </Link>

        <div className="text-center flex flex-col items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Lupa Password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan email yang terdaftar. Kami kirim instruksi pemulihan.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
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
                  placeholder="contoh@mahasiswa.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Kirim Tautan Pemulihan
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
