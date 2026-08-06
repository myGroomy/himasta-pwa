import { RegisterForm } from './register-form'
import Link from 'next/link'
import { School } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
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
            Buat Akun Baru
          </h1>
          <p className="text-xs text-slate-300">
            Lengkapi data diri untuk mendaftar kepengurusan
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-[#001c55] border border-white/10 p-6 rounded shadow-lg">
          <RegisterForm />

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-bold text-white hover:underline">
              Masuk disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
