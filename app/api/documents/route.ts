import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiSession, isApiResponse, serverError } from '@/lib/api'
import { uploadFile, validateFile } from '@/lib/storage'
import { z } from 'zod'
import type { SessionUser } from '@/lib/auth'

const metadataSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['NOTULEN', 'PROPOSAL', 'LPJ', 'LAINNYA']),
  divisionId: z.string().nullable().optional(),
})

export async function GET() {
  const result = await requireApiSession()
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const where =
    user.role === 'BPH'
      ? {}
      : user.role === 'DOSEN'
      ? { divisionId: null }
      : { OR: [{ divisionId: user.divisionId ?? '__none__' }, { divisionId: null }] }

  const documents = await prisma.document.findMany({
    where,
    include: {
      division: { select: { id: true, name: true, slug: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const result = await requireApiSession(['KADIV', 'BPH'])
  if (isApiResponse(result)) return result
  const user = result as SessionUser

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Data form tidak valid' }, { status: 400 })

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 })
  }

  const parsed = metadataSchema.safeParse({
    title: form.get('title'),
    description: form.get('description') || null,
    category: form.get('category'),
    divisionId: form.get('divisionId') || null,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 })
  }

  const { title, description, category, divisionId } = parsed.data

  if (divisionId && user.role === 'KADIV' && divisionId !== user.divisionId) {
    return NextResponse.json({ error: 'Kadiv hanya bisa upload ke divisi sendiri' }, { status: 403 })
  }

  if (!validateFile(file)) {
    return NextResponse.json({ error: 'Tipe/ukuran file tidak valid' }, { status: 400 })
  }

  const { url, error: uploadError } = await uploadFile(file, 'documents')
  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 400 })
  }

  try {
    const document = await prisma.document.create({
      data: {
        title,
        description: description ?? null,
        category,
        fileUrl: url,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        divisionId: divisionId ?? null,
        uploadedById: user.id,
      },
      include: {
        division: { select: { id: true, name: true, slug: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    })
    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    return serverError(error)
  }
}
