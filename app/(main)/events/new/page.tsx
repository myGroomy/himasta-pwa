import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { EventForm } from '@/components/shared/event-form'

export const dynamic = 'force-dynamic'

export default async function NewEventPage() {
  const user = await requireSession()

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div>
      <PageHeader
        title="Buat Event"
        description="Event publik dari divisi menunggu persetujuan BPH sebelum tayang."
      />
      <EventForm
        user={{ id: user.id, role: user.role, divisionId: user.divisionId }}
        divisions={divisions}
      />
    </div>
  )
}
