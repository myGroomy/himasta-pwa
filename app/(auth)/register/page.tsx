import { prisma } from '@/lib/prisma'
import { RegisterForm } from './register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RegisterPage() {
  const divisions = await prisma.division.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  return (
    <Card className="shadow-2xl border-slate-200/80 rounded-3xl overflow-hidden w-full max-w-md">
      <CardHeader className="items-center text-center bg-slate-900 text-white pb-8 pt-8 relative">
        <Link href="/login" className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Masuk
        </Link>

        <CardTitle className="text-2xl font-bold tracking-tight mt-6">Daftar Akun</CardTitle>
        <CardDescription className="text-slate-400 text-xs mt-1 max-w-xs">
          Silakan isi formulir di bawah ini untuk membuat akun baru. Akun baru memerlukan persetujuan BPH sebelum dapat digunakan.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <RegisterForm divisions={divisions} />
      </CardContent>
    </Card>
  )
}
