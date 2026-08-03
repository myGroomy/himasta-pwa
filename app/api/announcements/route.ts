import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getApiSession,
  requireApiSession,
  isApiResponse,
  badRequest,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const createSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  content: z.string().min(3, 'Konten minimal 3 karakter'),
  scope: z.enum(['GENERAL', 'DIVISION']),
  divisionId: z.string().nullable().optional(),
  category: z.enum(['event', 'beasiswa', 'akademik', 'organisasi']).default('organisasi'),
  visibleToDosen: z.boolean().default(false),
})

const ANNOUNCEMENT_INCLUDE = {
  author: { select: { id: true, name: true, email: true, role: true } },
  division: { select: { id: true, name: true, slug: true } },
  approvedBy: { select: { id: true, name: true } },
}

export async function GET() {
  const user = await getApiSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const where = buildFeedWhere(user)
  const announcements = await prisma.announcement.findMany({
    where,
    include: ANNOUNCEMENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')
  }

  const { title, content, scope, divisionId, category, visibleToDosen } = parsed.data

  if (scope === 'DIVISION' && !divisionId) {
    return badRequest('Divisi wajib diisi untuk pengumuman divisi')
  }

  if (scope === 'DIVISION' && user.role === 'KADIV' && divisionId !== user.divisionId) {
    return NextResponse.json(
      { error: 'Kadiv hanya bisa posting ke divisi sendiri' },
      { status: 403 }
    )
  }

  const isGeneral = scope === 'GENERAL'
  const needsApproval = isGeneral && user.role !== 'BPH'
  const status = needsApproval ? 'PENDING_APPROVAL' : 'PUBLISHED'

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category,
        scope,
        divisionId: scope === 'DIVISION' ? divisionId : null,
        status,
        authorId: user.id,
        approvedById: status === 'PUBLISHED' ? user.id : null,
        visibleToDosen,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: ANNOUNCEMENT_INCLUDE,
    })

    if (status === 'PUBLISHED') {
      await createAnnouncementNotifications(announcement.id, user)
    } else if (status === 'PENDING_APPROVAL') {
      await notifyBphPending(announcement.id, user, title)
    }

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}

function buildFeedWhere(user: SessionUser) {
  if (user.role === 'BPH') return {}
  if (user.role === 'DOSEN') return { visibleToDosen: true }
  return {
    OR: [
      { scope: 'GENERAL' as const },
      ...(user.divisionId
        ? [{ scope: 'DIVISION' as const, divisionId: user.divisionId }]
        : []),
    ],
  }
}

async function createAnnouncementNotifications(
  announcementId: string,
  author: SessionUser
) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { title: true, scope: true, divisionId: true },
  })
  if (!announcement) return

  const recipients = await prisma.user.findMany({
    where: {
      id: { not: author.id },
      isActive: true,
      ...(announcement.scope === 'DIVISION' && announcement.divisionId
        ? { divisionId: announcement.divisionId }
        : {}),
    },
    select: { id: true },
  })

  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId: r.id,
      title: 'Pengumuman baru',
      message: announcement.title,
      link: `/announcements/${announcementId}`,
    })),
  })
}

async function notifyBphPending(announcementId: string, author: SessionUser, title: string) {
  const bphs = await prisma.user.findMany({
    where: { role: 'BPH', isActive: true, id: { not: author.id } },
    select: { id: true },
  })
  if (bphs.length === 0) return
  await prisma.notification.createMany({
    data: bphs.map((b) => ({
      userId: b.id,
      title: 'Menunggu approval',
      message: `Pengumuman "${title}" dari ${author.name} menunggu persetujuan Anda.`,
      link: `/admin/approval`,
    })),
  })
}
