import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/search?q=...&type=all|dokumen|pengumuman|proker|event&divisionId=...
export async function GET(req: NextRequest) {
  try {
    await requireRole(['ANGGOTA', 'KADIV', 'BPH', 'DOSEN'])

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() ?? ''
    const type = searchParams.get('type') ?? 'all'
    const divisionId = searchParams.get('divisionId')

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const results: {
      type: string
      id: string
      title: string
      excerpt: string
      href: string
      divisionName?: string
      createdAt: Date
    }[] = []

    const searchFilter = (field: string) => ({
      contains: q,
      mode: 'insensitive' as const,
    })

    // Search announcements
    if (type === 'all' || type === 'pengumuman') {
      const announcements = await prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
          ...(divisionId ? { divisionId } : {}),
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          division: { select: { name: true } },
        },
        take: 5,
        orderBy: { publishedAt: 'desc' },
      })
      for (const a of announcements) {
        results.push({
          type: 'Pengumuman',
          id: a.id,
          title: a.title,
          excerpt: a.content.slice(0, 120) + (a.content.length > 120 ? '...' : ''),
          href: `/announcements/${a.id}`,
          divisionName: a.division?.name,
          createdAt: a.createdAt,
        })
      }
    }

    // Search documents
    if (type === 'all' || type === 'dokumen') {
      const docs = await prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { fileName: { contains: q, mode: 'insensitive' } },
          ],
          ...(divisionId ? { divisionId } : {}),
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          createdAt: true,
          division: { select: { name: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      })
      for (const d of docs) {
        results.push({
          type: 'Dokumen',
          id: d.id,
          title: d.title,
          excerpt: d.description?.slice(0, 120) ?? `Kategori: ${d.category}`,
          href: `/dokumen`,
          divisionName: d.division?.name,
          createdAt: d.createdAt,
        })
      }
    }

    // Search proker
    if (type === 'all' || type === 'proker') {
      const prokers = await prisma.proker.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
          ...(divisionId ? { divisionId } : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          createdAt: true,
          division: { select: { name: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      })
      for (const p of prokers) {
        results.push({
          type: 'Proker',
          id: p.id,
          title: p.name,
          excerpt: p.description?.slice(0, 120) ?? `Status: ${p.status}`,
          href: `/proker`,
          divisionName: p.division.name,
          createdAt: p.createdAt,
        })
      }
    }

    // Search events
    if (type === 'all' || type === 'event') {
      const events = await prisma.event.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
          ...(divisionId ? { divisionId } : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          startTime: true,
          createdAt: true,
          division: { select: { name: true } },
        },
        take: 5,
        orderBy: { startTime: 'desc' },
      })
      for (const e of events) {
        results.push({
          type: 'Event',
          id: e.id,
          title: e.name,
          excerpt: e.description?.slice(0, 120) ?? `Mulai: ${new Date(e.startTime).toLocaleDateString('id-ID')}`,
          href: `/events/${e.id}`,
          divisionName: e.division?.name,
          createdAt: e.createdAt,
        })
      }
    }

    // Sort by recency
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ results, total: results.length })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
