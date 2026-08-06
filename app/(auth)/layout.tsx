import { redirect } from 'next/navigation'
import { getOptionalSession } from '@/lib/permissions'
import { HierarchicalNavigation } from '@/components/shared/hierarchical-navigation'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalSession()
  if (user) redirect('/')
  return (
    <div className="flex min-h-screen justify-center bg-background md:bg-muted/30">
      <HierarchicalNavigation />
      <div className="w-full max-w-md bg-primary min-h-screen relative overflow-hidden md:shadow-2xl flex flex-col">
        {children}
      </div>
    </div>
  )
}
