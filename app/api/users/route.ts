import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, serverError, badRequest, rateLimited } from '@/lib/api'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import type { SessionUser } from '@/lib/auth'

const createSchema = z.object({
  nim: z.string().min(3).max(20).optional().nullable(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100).default('himasta123'),
  role: z.enum(['ANGGOTA', 'KADIV', 'BPH', 'DOSEN']).default('ANGGOTA'),
  divisionId: z.string().nullable().optional(),
  phone: z.string().max(20).optional().nullable(),
})

export async function GET(req: NextRequest) {
  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const { searchParams } = new URL(req.url)
  const divisionId = searchParams.get('divisionId') || undefined
  const role = searchParams.get('role') || undefined
  const query = searchParams.get('q') || undefined

  try {
    const users = await prisma.user.findMany({
      where: {
        ...(divisionId ? { divisionId } : {}),
        ...(role ? { role: role as never } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { nim: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        nim: true,
        email: true,
        name: true,
        role: true,
        divisionId: true,
        phone: true,
        photoUrl: true,
        isActive: true,
        pendingApproval: true,
        createdAt: true,
        division: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ users })
  } catch (error) {
    return serverError(error)
  }
}

export async function POST(req: NextRequest) {
  const limited = rateLimited(req, { limit: 20 })
  if (limited) return limited

  const result = await requireApiSession(['BPH'])
  if (isApiResponse(result)) return result

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Data tidak valid')

  const { nim, email, name, password, role, divisionId, phone } = parsed.data

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: email.toLowerCase() }, ...(nim ? [{ nim }] : [])] },
  })
  if (exists) return badRequest('Email atau NIM sudah terdaftar')

  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        nim: nim ?? null,
        email: email.toLowerCase(),
        name,
        password: hashed,
        role,
        divisionId: divisionId ?? null,
        phone: phone ?? null,
      },
      select: {
        id: true,
        nim: true,
        email: true,
        name: true,
        role: true,
        divisionId: true,
        phone: true,
        photoUrl: true,
        isActive: true,
        pendingApproval: true,
        createdAt: true,
        division: { select: { id: true, name: true, slug: true } },
      }
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}
