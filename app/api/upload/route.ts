import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/permissions'
import { uploadFile } from '@/lib/storage'
import { rateLimited } from '@/lib/api'

export async function POST(request: Request) {
  try {
    const user = await requireSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Batasi upload per IP — cegah spam file / banjir storage.
    const limited = rateLimited(request as unknown as NextRequest, { limit: 20 })
    if (limited) return limited

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const { url, error } = await uploadFile(file, 'editor-images')

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
