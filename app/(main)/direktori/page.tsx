import Link from 'next/link'
import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function DirektoriPage() {
  const user = await requireSession()

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    include: {
      users: {
        where: { isActive: true, role: { not: 'DOSEN' } },
        select: { id: true, name: true, nim: true, role: true, phone: true },
        orderBy: [{ role: 'asc' }, { name: 'asc' }],
      },
    },
  })

  const dosen = await prisma.user.findMany({
    where: { role: 'DOSEN', isActive: true },
    select: { id: true, name: true, email: true },
  })

  return (
    <div className="space-y-8">
      <PageHeader title="Direktori Organisasi" description="Struktur organisasi HIMASTA dan kontak pengurus." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {divisions.map((division) => (
          <Card key={division.id}>
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <Link href={`/divisi/${division.slug}`} className="text-lg font-semibold hover:underline">
                  {division.name}
                </Link>
                <Badge variant="secondary">{division.users.length} anggota</Badge>
              </div>
              <div className="space-y-2">
                {division.users.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada anggota.</p>
                )}
                {division.users.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.nim ?? '—'} {m.phone ? ` · ${m.phone}` : ''}
                      </p>
                    </div>
                    {m.role === 'KADIV' && (
                      <Badge variant="info" className="shrink-0">
                        Kadiv
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dosen.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Dosen</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dosen.map((d) => (
              <Card key={d.id}>
                <CardContent className="pt-6">
                  <p className="font-medium">{d.name}</p>
                  <p className="text-sm text-muted-foreground">{d.email}</p>
                  <Badge className="mt-2">{ROLE_LABELS.DOSEN}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
