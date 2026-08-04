# Setup Guide - HIMASTA App

> **Panduan instalasi dependencies untuk development**

---

## Prasyarat

Pastikan sudah terinstall (di disk C, minimal space):
- **Node.js v18+** (~100 MB) - Download: https://nodejs.org/
- **Git** (opsional) - Download: https://git-scm.com/

Cek instalasi:
```powershell
node --version    # harus v18 atau lebih baru
npm --version     # harus v9 atau lebih baru
```

---

## Langkah Instalasi

### 1. Buka PowerShell di Folder Project

```powershell
# Navigasi ke folder project
cd "d:\1. MAIN FILE_Taufik\Downloads\Download Brave\HIMASTA"
```

### 2. Install Dependencies (Pilih Salah Satu)

#### Opsi A: Menggunakan npm (Default)
```powershell
npm install
```

#### Opsi B: Menggunakan pnpm (Lebih Hemat Space)
```powershell
# Install pnpm global terlebih dahulu (hanya sekali)
npm install -g pnpm

# Lalu install dependencies
pnpm install
```

#### Opsi C: Menggunakan yarn
```powershell
# Install yarn global terlebih dahulu (hanya sekali)
npm install -g yarn

# Lalu install dependencies
yarn install
```

**Waktu instalasi:** ~5-10 menit (tergantung koneksi internet)  
**Space yang dibutuhkan:** ~400-500 MB di folder project

### 3. Verifikasi Instalasi

Setelah selesai, cek folder `node_modules` sudah ada:
```powershell
dir node_modules
```

Harus muncul banyak folder dependencies.

---

## Setup Database (Prisma + Supabase)

### 1. Buat File Environment

Buat file `.env.local` di root project:
```powershell
# Buat file .env.local
New-Item -Path ".env.local" -ItemType File -Force
```

### 2. Isi Environment Variables

Edit `.env.local` dengan notepad atau code editor:
```env
# Database (Supabase)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**Note:** Anda perlu mendaftar ke Supabase terlebih dahulu untuk mendapatkan credentials.

### 3. Setup Prisma

```powershell
# Generate Prisma Client (otomatis jalan saat npm install)
npx prisma generate

# (Nanti) Push schema ke database
npx prisma db push
```

---

## Menjalankan Development Server

```powershell
# Jalankan server development
npm run dev

# Atau dengan pnpm/yarn
pnpm dev
# yarn dev
```

Buka browser: http://localhost:3000

---

## Struktur Folder Setelah Setup

```
d:\1. MAIN FILE_Taufik\Downloads\Download Brave\HIMASTA\
├── node_modules/          ← Dependencies terinstall di sini (~400-500 MB)
├── .next/                 ← Build cache Next.js (muncul saat dev/build)
├── prisma/               
│   └── schema.prisma     ← (Akan dibuat nanti)
├── app/                  ← (Akan dibuat nanti)
├── components/           ← (Akan dibuat nanti)
├── lib/                  ← (Akan dibuat nanti)
├── public/               ← (Akan dibuat nanti)
├── package.json          ✓ Sudah ada
├── .env.local            ← Buat manual
├── next.config.js        ← (Akan dibuat nanti)
├── tsconfig.json         ← (Akan dibuat nanti)
└── tailwind.config.ts    ← (Akan dibuat nanti)
```

---

## Troubleshooting

### Error: "npm is not recognized"
- Node.js belum terinstall atau tidak ada di PATH
- Install Node.js dari https://nodejs.org/
- Restart PowerShell setelah install

### Error: "Cannot find module"
- Jalankan `npm install` lagi
- Hapus `node_modules` dan `package-lock.json`, lalu install ulang:
  ```powershell
  Remove-Item -Recurse -Force node_modules
  Remove-Item package-lock.json
  npm install
  ```

### Error: "Prisma Client not generated"
- Jalankan: `npx prisma generate`

### Instalasi Lambat
- Cek koneksi internet
- Gunakan npm cache: `npm cache clean --force` lalu install ulang
- Coba gunakan pnpm yang lebih cepat

### Space Disk D Penuh
- Minimal perlu ~500 MB free space untuk node_modules
- Hapus node_modules: `Remove-Item -Recurse -Force node_modules`
- Bisa install ulang kapan saja

---

## Uninstall Dependencies

Kalau mau hapus semua dependencies (bersihkan space):
```powershell
# Hapus node_modules
Remove-Item -Recurse -Force node_modules

# Hapus lock files
Remove-Item package-lock.json
# atau untuk pnpm: Remove-Item pnpm-lock.yaml
# atau untuk yarn: Remove-Item yarn.lock
```

**Note:** File `package.json` tetap ada, jadi bisa install ulang kapan saja dengan `npm install`.

---

## Next Steps

Setelah dependencies terinstall:
1. ✓ Dependencies installed
2. ✓ Prisma schema dibuat (`prisma/schema.prisma`)
3. ✓ Next.js config (`next.config.js`, `tsconfig.json`)
4. ✓ Tailwind CSS (`tailwind.config.ts`, `globals.css`)
5. ✓ Struktur folder app dibuat (auth, portal, absensi, dokumen, direktori, admin)
6. ✓ Autentikasi (NextAuth credentials + middleware + login page)
7. ✓ UI components (shadcn-style + navbar + layout)
8. ✓ Fitur V1 lengkap (pengumuman, absensi QR, dokumen, direktori, notifikasi, admin)

## Sebelum Menjalankan (wajib)

App butuh koneksi database PostgreSQL untuk berjalan penuh:

1. Isi `DATABASE_URL`, `NEXTAUTH_SECRET`, dan Supabase Storage di `.env.local`
2. Push schema ke database:
   ```powershell
   npx prisma db push
   ```
3. Seed data demo (5 divisi + 10 user + contoh pengumuman):
   ```powershell
   npm run db:seed
   ```
4. Jalankan:
   ```powershell
   npm run dev
   ```
   Login demo: `bph@himasta.id` / `himasta123`

---

**Status:** Dependencies setup ready  
**Terakhir diperbarui:** 2026-08-02
