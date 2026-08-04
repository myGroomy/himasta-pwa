import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { timeAgo } from '@/lib/utils'
import { MessageSquarePlus, User as UserIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Kritik & Saran | Admin BPH',
}

export default async function AdminFeedbackPage() {
  await requireRole(['BPH'])

  const feedbacks = await prisma.feedbackBPH.findMany({
    include: {
      author: { select: { name: true, nim: true } },
      period: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Mark all as read conceptually (we could have a PATCH API to do this interactively)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kritik & Saran</h1>
          <p className="text-sm text-muted-foreground">
            Daftar masukan dari anggota HIMASTA.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
          Total: {feedbacks.length}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {feedbacks.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
            Belum ada kritik dan saran yang masuk.
          </div>
        ) : (
          feedbacks.map((f) => (
            <Card key={f.id} className="relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${f.isRead ? 'bg-muted' : 'bg-primary'}`} />
              <CardHeader className="pb-3 flex flex-row justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    {f.isAnon ? 'Pengguna Anonim' : f.author?.name}
                  </CardTitle>
                  {!f.isAnon && f.author?.nim && (
                    <p className="text-xs text-muted-foreground">{f.author.nim}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(f.createdAt)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{f.content}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-secondary/50">
                    Periode: {f.period.name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
