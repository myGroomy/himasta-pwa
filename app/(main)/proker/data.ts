import { prisma } from '@/lib/prisma'

// Daftar user utk dropdown assign task & PJ (semua aktif)
export async function getApiUserList() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, role: true, divisionId: true },
    orderBy: { name: 'asc' },
  })
  return users
}
