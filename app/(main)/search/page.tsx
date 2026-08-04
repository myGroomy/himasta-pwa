import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { SearchPage } from '@/components/search/search-page'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Cari | HIMASTA',
  description: 'Cari pengumuman, dokumen, proker, dan event di HIMASTA',
}

export default async function SearchRoute() {
  await requireRole(['ANGGOTA', 'KADIV', 'BPH', 'DOSEN'])

  const divisions = await prisma.division.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="py-4">
      <SearchPage divisions={divisions} />
    </div>
  )
}
