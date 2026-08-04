import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, badRequest, notFound, serverError, rateLimited } from '@/lib/api'
import type { SessionUser } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  role: z.enum(['ANGGOTA', 'KADIV', 'BPH', 'DOSEN']).optional(),
  divisionId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  password: z.string().min(6).max(100).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const limited = rateLimited(req, { limit: 60 })
  if (limited) return limited

  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const body = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return notFound('User tidak ditemukan')

  if (target.id === user.id && parsed.data.isActive === false) {
    return badRequest('Anda tidak dapat menonaktifkan akun sendiri')
  }

  const { password, ...rest } = parsed.data
  let hashedPassword: string | undefined
  if (password) {
    const bcrypt = await import('bcryptjs')
    hashedPassword = await bcrypt.hash(password, 10)
  }

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...rest,
        divisionId: 'divisionId' in parsed.data ? parsed.data.divisionId : undefined,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
      include: {
        division: { select: { id: true, name: true, slug: true } },
      },
    })
    return NextResponse.json({ user })
  } catch (error) {
    return serverError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  if (params.id === user.id) {
    return badRequest('Anda tidak dapat menghapus akun sendiri')
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return notFound('User tidak ditemukan')

  try {
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return serverError(error)
  }
}
