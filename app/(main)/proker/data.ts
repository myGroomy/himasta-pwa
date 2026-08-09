import { prisma } from '@/lib/prisma'

// Daftar user utk dropdown assign task & PJ (semua aktif; scoped per divisi utk non-BPH)
export async function getApiUserList(divisionId?: string | null) {
  const users = await prisma.user.findMany({
    where: { isActive: true, ...(divisionId ? { divisionId } : {}) },
    select: { id: true, name: true, role: true, divisionId: true },
    orderBy: { name: 'asc' },
  })
  return users
}
