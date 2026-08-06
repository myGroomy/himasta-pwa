'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <>
      {/* Top Section */}
      <div className="relative flex-shrink-0 px-8 pb-10 pt-20 text-primary-foreground">
        {/* Decorative Shapes */}
        <div className="absolute -left-6 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-10 top-20 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">Oops!</h1>
          <p className="mt-2 text-lg font-light text-primary-foreground/90">Lupa kata sandi Anda?</p>
        </div>
      </div>

      {/* Bottom Card Section */}
      <div className="flex-1 rounded-t-[40px] bg-background px-8 pb-8 pt-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 flex flex-col">
        <div className="mb-6">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors font-medium">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login
          </Link>
        </div>
        
        <h2 className="text-3xl font-bold text-primary mb-4">Pemulihan</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Masukkan alamat email yang terdaftar. Kami akan mengirimkan instruksi untuk memulihkan kata sandi Anda.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-full bg-muted/40 pl-12 h-14 border-transparent focus-visible:ring-primary/20 text-base"
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full rounded-full h-14 text-base font-semibold mt-6 shadow-lg hover:shadow-xl transition-shadow" disabled={loading}>
            {loading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            Kirim Tautan Pemulihan
          </Button>
        </form>
      </div>
    </>
  )
}
