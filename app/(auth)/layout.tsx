import { redirect } from 'next/navigation'
import { getOptionalSession } from '@/lib/permissions'
import { isDatabaseConfigured } from '@/lib/prisma'
import { HierarchicalNavigation } from '@/components/shared/hierarchical-navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalSession()
  if (user) redirect('/')
  return (
    <div className="flex min-h-screen justify-center bg-background md:bg-muted/30">
      <HierarchicalNavigation />
      <div className="w-full max-w-md bg-primary min-h-screen relative overflow-hidden md:shadow-2xl flex flex-col">
        {!isDatabaseConfigured() && (
          <div className="px-6 py-3 bg-amber-400 text-amber-950 text-xs font-semibold text-center z-10 border-b border-amber-300">
            Database belum dikonfigurasi. Salin <code className="font-bold">.env.example</code> ke{' '}
            <code className="font-bold">.env</code> dan isi DATABASE_URL sebelum login.
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
