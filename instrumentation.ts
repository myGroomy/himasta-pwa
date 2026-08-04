// Validasi konfigurasi lingkungan saat startup (Next.js 14+ instrumentation hook).
// Dijalankan sekali saat server dimulai memastikan env yang dibutuhkan tersedia.

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const missing = REQUIRED_ENV.filter((k) => !process.env[k])
    if (missing.length > 0) {
      // Jangan crash server dev, tapi log jelas. Prod: crash agar tidak deploy rusak.
      const message = `HIMASTA: variabel env berikut tidak terisi: ${missing.join(', ')}`
      console.error(message)
      if (process.env.NODE_ENV === 'production') {
        throw new Error(message)
      }
    }
  }
}

const REQUIRED_ENV = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  // Supabase Storage opsional aplikasi punya fallback lokal untuk dev
  // 'NEXT_PUBLIC_SUPABASE_URL',
  // 'SUPABASE_SERVICE_ROLE_KEY',
]
