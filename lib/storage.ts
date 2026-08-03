import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

function isSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')
  )
}

const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'image/webp',
])

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export function validateFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    return 'Tipe file tidak diizinkan. Gunakan PDF, Word, Excel, atau gambar.'
  }
  if (file.size > MAX_SIZE) {
    return 'Ukuran file melebihi 10 MB.'
  }
  return null
}

export async function uploadFile(file: File, folder: string): Promise<{ url: string; error?: string }> {
  const validation = validateFile(file)
  if (validation) return { url: '', error: validation }

  const ext = path.extname(file.name).toLowerCase() || '.bin'
  const safeName = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`
  const storagePath = `${folder}/${safeName}`

  if (isSupabaseConfigured()) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { contentType: file.type, upsert: false })

    if (error) return { url: '', error: `Upload ke storage gagal: ${error.message}` }

    const { data } = supabase.storage.from('documents').getPublicUrl(storagePath)
    return { url: data.publicUrl }
  }

  // Fallback development: simpan lokal ke /public/uploads
  const bytes = Buffer.from(await file.arrayBuffer())
  const publicDir = path.join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(publicDir, { recursive: true })
  await writeFile(path.join(publicDir, safeName), bytes)
  return { url: `/uploads/${folder}/${safeName}` }
}
