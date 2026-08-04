import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics | HIMASTA',
  description: 'Dashboard laporan dan analitik organisasi HIMASTA',
}

export default async function AnalyticsPage() {
  await requireRole(['BPH'])

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Analytics & Laporan</h1>
          <p className="text-sm text-muted-foreground">
            Insight kehadiran, proker, dan keaktifan anggota lintas divisi
          </p>
        </div>
      </div>

      <AnalyticsDashboard divisions={divisions} />
    </div>
  )
}
