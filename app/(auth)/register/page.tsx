import { RegisterForm } from './register-form'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { google?: string }
}) {
  const fromGoogle = searchParams.google === 'new'

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-sm mx-auto space-y-8">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-border bg-muted mb-2">
            <Image
              src="/himasta-logo.webp"
              alt="Logo HIMASTA"
              fill
              className="object-contain p-1"
            />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi data diri untuk mendaftar kepengurusan
          </p>
        </div>

        {fromGoogle && (
          <p className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed text-left">
            Email Google Anda belum terdaftar di HIMASTA. Silakan daftar dulu
            seperti biasa, lalu nanti bisa masuk lewat Google.
          </p>
        )}

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <RegisterForm />

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Masuk disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
