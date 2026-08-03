import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { AnnouncementForm } from '@/components/shared/announcement-form'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function NewAnnouncementPage({
  searchParams,
}: {
  searchParams: { division?: string }
}) {
  const user = await requireRole(['KADIV', 'BPH'])
  const isBPH = user.role === 'BPH'

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  const preset = searchParams.division
  const presetDivision = preset ? divisions.find((d) => d.id === preset) : null

  if (!isBPH && presetDivision && presetDivision.id !== user.divisionId) {
    const own = divisions.find((d) => d.id === user.divisionId)
    if (own) redirect(`/announcements/new?division=${own.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Buat Pengumuman"
        description={isBPH ? 'Postingan general langsung tayang. Postingan divisi bisa dibuat untuk divisi mana pun.' : 'Postingan divisi Anda langsung tayang di workspace. Postingan general perlu approval BPH.'}
      />
      <Card>
        <CardContent className="pt-6">
          <AnnouncementForm
            divisions={divisions}
            defaultScope={presetDivision ? 'DIVISION' : isBPH ? 'GENERAL' : 'DIVISION'}
            allowGeneral
            isBPH={isBPH}
            presetDivisionId={presetDivision?.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
