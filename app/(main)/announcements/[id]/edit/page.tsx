import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { AnnouncementForm } from '@/components/shared/announcement-form'
import { PageHeader } from '@/components/shared/page-header'
import { notFound, redirect } from 'next/navigation'

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const user = await requireSession()
  
  if (user.role === 'ANGGOTA' || user.role === 'DOSEN') {
    redirect('/announcements')
  }

  const announcement = await prisma.announcement.findUnique({
    where: { id: params.id }
  })

  if (!announcement) return notFound()

  const isOwner = announcement.authorId === user.id
  const canEdit = user.role === 'BPH' || (user.role === 'KADIV' && isOwner)

  if (!canEdit) {
    redirect(`/announcements/${params.id}`)
  }

  const divisions = await prisma.division.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <PageHeader
        title="Edit Pengumuman"
        description="Perbarui informasi pengumuman ini."
      />
      <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6 shadow-sm mt-6">
        <AnnouncementForm
          divisions={divisions}
          allowGeneral={user.role === 'BPH' || user.role === 'KADIV'}
          isBPH={user.role === 'BPH'}
          initialData={announcement}
        />
      </div>
    </div>
  )
}
