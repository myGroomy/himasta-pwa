import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  requireApiSession,
  isApiResponse,
  badRequest,
  forbidden,
  notFound,
  serverError,
} from '@/lib/api'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

// Anggota bisa update status task miliknya; kadiv/BPH bisa update semua field proker divisi sendiri
const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(['BELUM', 'BERJALAN', 'SELESAI']).optional(),
  assigneeId: z.string().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireApiSession()
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      proker: { select: { divisionId: true, status: true } },
      division: { select: { id: true } },
    },
  })
  if (!task) return notFound('Task tidak ditemukan')

  const isProkerManager =
    user.isSuper ||
    user.role === 'BPH' ||
    (user.role === 'KADIV' &&
      ((task.proker && task.proker.divisionId === user.divisionId) ||
        (task.division && task.division.id === user.divisionId)))
  const isAssignee = task.assigneeId === user.id

  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  // Update status → pemilik task atau pengelola proker. Update lain → pengelola proker.
  const onlyStatus = Object.keys(parsed.data).every((k) => k === 'status')
  if (!isProkerManager && !(isAssignee && onlyStatus)) {
    return forbidden('Tidak punya akses ke task ini')
  }

  try {
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        ...parsed.data,
        assigneeId:
          parsed.data.assigneeId === undefined ? undefined : (parsed.data.assigneeId ?? null),
      },
      include: { assignee: { select: { id: true, name: true } } },
    })

    // Progress task menggerakkan status proker induk (task divisi tanpa proker di-skip)
    if (task.prokerId) await syncProkerStatus(task.prokerId)

    return NextResponse.json({ task: updated })
  } catch (error) {
    return serverError(error)
  }
}

// Proker otomatis SELESAI saat semua task selesai; BERJALAN saat ada task berjalan
async function syncProkerStatus(prokerId: string) {
  const proker = await prisma.proker.findUnique({
    where: { id: prokerId },
    select: { status: true },
  })
  if (!proker || proker.status === 'DIBATALKAN' || proker.status === 'SELESAI') return

  const [total, done, active] = await Promise.all([
    prisma.task.count({ where: { prokerId } }),
    prisma.task.count({ where: { prokerId, status: 'SELESAI' } }),
    prisma.task.count({ where: { prokerId, status: { in: ['BELUM', 'BERJALAN'] } } }),
  ])
  if (total === 0) return
  if (done === total) {
    await prisma.proker.update({ where: { id: prokerId }, data: { status: 'SELESAI' } })
  } else if (active > 0) {
    await prisma.proker.update({ where: { id: prokerId }, data: { status: 'BERJALAN' } })
  }
}
