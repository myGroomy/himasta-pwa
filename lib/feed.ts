import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/lib/auth'
import type { Prisma } from '@prisma/client'

export type AnnouncementWithRelations = Prisma.AnnouncementGetPayload<{
  include: {
    author: { select: { name: true; email: true } }
    division: { select: { name: true; slug: true } }
  }
}>

function announcementWhereFor(user: SessionUser): Prisma.AnnouncementWhereInput {
  if (user.role === 'BPH') return {}
  if (user.role === 'DOSEN') return { visibleToDosen: true }
  return {
    OR: [
      { scope: 'GENERAL' },
      ...(user.divisionId ? [{ scope: 'DIVISION' as const, divisionId: user.divisionId }] : []),
    ],
  }
}

const ANNOUNCEMENT_INCLUDE = {
  author: { select: { name: true, email: true } },
  division: { select: { name: true, slug: true } },
} satisfies Prisma.AnnouncementInclude

export async function getPublishedAnnouncements(user: SessionUser, extraWhere: Prisma.AnnouncementWhereInput = {}) {
  return prisma.announcement.findMany({
    where: {
      status: 'PUBLISHED',
      ...announcementWhereFor(user),
      ...extraWhere,
    },
    include: ANNOUNCEMENT_INCLUDE,
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })
}

export async function getAnnouncementById(id: string, user: SessionUser) {
  return prisma.announcement.findFirst({
    where: {
      id,
      status: 'PUBLISHED',
      ...announcementWhereFor(user),
    },
    include: ANNOUNCEMENT_INCLUDE,
  })
}
