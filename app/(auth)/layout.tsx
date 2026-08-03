import { redirect } from 'next/navigation'
import { getOptionalSession } from '@/lib/permissions'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalSession()
  if (user) redirect('/')
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
