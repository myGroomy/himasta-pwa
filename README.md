# HIMASTA Sistem Informasi & Operasional

PWA berbasis Next.js 14 untuk operasional internal HIMASTA (portal info, absensi QR, arsip dokumen, workspace divisi, proker, event, dan perizinan).

## Arsitektur

```
┌──────────────────────────────┐      ┌───────────────────────────────────────┐
│  App HIMASTA (Next.js 14)    │      │  Supabase Cloud                      │
│  http://localhost:3000       │─────▶│  Postgres (pooler :6543, direct :5432)│
│  .env.local                  │      │  Storage (bucket "documents")        │
└──────────────┬───────────────┘      └───────────────────────────────────────┘
               │ Cloudflare Tunnel (scripts/with-tunnel.mjs)
               ▼
        https://himasta.livowear.my.id
```

- **App HIMASTA** adalah kode aplikasi (`app/`, `components/`, `lib/`, `prisma/`). Di folder proyek ini.
- **Supabase Cloud** dipakai sebagai Postgres dan Storage. Prisma terhubung lewat pooler port `6543` dengan `pgbouncer=true`, dan memakai `DIRECT_URL` untuk koneksi langsung port `5432`. Tanpa `DIRECT_URL`, Prisma gagal dengan error `no tenant identifier provided`.
- **Cloudflare Tunnel** membuat app yang jalan di `localhost:3000` bisa diakses publik lewat domain. `npm run dev` dan `npm run start` otomatis menyalakan tunnel lewat `scripts/with-tunnel.mjs`. Bisa dimatikan kapan saja (lihat bagian Variabel Tunnel).

---

## Prasyarat Sistem

```bash
node --version     # v18 atau lebih baru (lihat .nvmrc: 18.20.4)
npm --version      # v9 atau lebih baru
git --version
cloudflared --version   # untuk akses publik via tunnel (opsional untuk dev lokal)
```

Windows: pastikan `cloudflared` bisa diakses dari terminal (taruh di PATH atau `~/.local/bin`). Di sistem ini binary ada di `~/.local/bin/cloudflared`.

---

## Setup Awal App (Hanya Sekali, Machine Baru / Repo Baru)

> Setup di bawah memakai **Supabase Cloud** sesuai konfigurasi aktif. Alternatif Supabase lokal (Docker) tersedia sebagai opsi komentar di `.env.example`, tapi bukan jalur utama.

### 1. Install dependencies

```bash
npm install
```

### 2. Buat file environment

Buat dua file dari template:

```bash
cp .env.example .env
cp .env.example .env.local
```

- `.env` dipakai Prisma CLI (`npx prisma db push`, `npm run db:seed`, `npx prisma studio`).
- `.env.local` dipakai Next.js saat menjalankan app.

Isi nilai penting (versi Supabase Cloud):

```env
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key dari Supabase Dashboard>"
SUPABASE_SERVICE_ROLE_KEY="<service role key dari Supabase Dashboard>"

NEXTAUTH_SECRET="<random-long-string>"   # openssl rand -base64 32
NEXTAUTH_URL="https://himasta.livowear.my.id"
```

Tambahan opsional:

- **Login Google**: `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`. Kalau tidak diisi, tombol Google tidak muncul.
- **Push notification**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (generate dengan paket `web-push`).

> **Jangan pernah commit key asli ke git.** `.gitignore` sudah mencakup `.env` dan `.env.local`.

### 3. Sinkronkan schema ke database

```bash
npx prisma db push
```

Membuat semua tabel dari `prisma/schema.prisma` ke Postgres Supabase. Aman dijalankan ulang.

### 4. Seed data demo (opsional, idempotent)

```bash
npm run db:seed          # data demo utama (divisi, user, pengumuman, sesi absensi)
npm run db:seed:dummy    # data dummy besar untuk tes analytics & periode
```

### 5. Buat Storage bucket `documents`

Buka **Supabase Dashboard** (project aktif) → **Storage** → **New bucket** → nama `documents` → centang **Public**.

Wajib sebelum upload dokumen. App menulis ke bucket `documents` (`lib/storage.ts`).

### 6. Verifikasi

1. `npm run dev` → buka **http://localhost:3000** → login `bph@himasta.id` / `himasta123`.
2. Lihat pengumuman contoh di halaman utama. Berarti DB + auth jalan.

---

## Menjalankan App

```bash
npm run dev      # dev server, plus prompt mode tunnel (Local / Domain)
npm run build    # production build (cek compile + type + lint, generate PWA service worker)
npm run start    # jalankan hasil build, plus tunnel
```

Saat `npm run dev` dijalankan, wrapper akan bertanya lewat mana app diakses:

```
Akses lewat mana?
  1) Local (http://localhost:3000)
  2) Domain (tunnel)
Pilihan [Enter=Local]:
```

- Pilih **1 / Local**: app hanya bisa diakses di `localhost:3000`.
- Pilih **2 / Domain**: Cloudflare tunnel dinyalakan, app bisa diakses publik lewat `https://himasta.livowear.my.id`.
- Kalau `cloudflared` tidak terpasang, config tunnel belum ada, atau tunnel belum terdaftar, wrapper otomatis memakai mode Local.

Akses publik (setelah pilih Domain): **https://himasta.livowear.my.id**

### Variabel Tunnel

Variabel ini dibaca dari **environment shell** (bukan dari `.env`), karena wrapper berjalan sebelum Next.js mulai.

```bash
TUNNEL_DISABLED=1 npm run dev      # nonaktifkan tunnel, selalu localhost
TUNNEL_MODE=local npm run dev      # paksa mode Local tanpa bertanya
TUNNEL_MODE=domain npm run dev     # paksa mode Domain tanpa bertanya
```

| Variabel | Default | Fungsi |
|---|---|---|
| `TUNNEL_DISABLED` | kosong | `1` = matikan tunnel |
| `TUNNEL_MODE` | `ask` | `ask` / `local` / `domain` |
| `TUNNEL` | `himasta` | nama tunnel Cloudflare |
| `TUNNEL_DOMAIN` | kosong | URL publik yang ditampilkan di log (contoh `https://himasta.livowear.my.id`) |
| `CLOUDFLARED` | `~/.local/bin/cloudflared` | path binary `cloudflared` |

Catatan: kalau `NEXTAUTH_URL` memakai domain publik, app hanya bisa diakses penuh (termasuk OAuth callback) lewat domain tersebut.

### PWA

- Build (`npm run build`) otomatis menghasilkan service worker lewat **next-pwa** di `public/`.
- Aset UI (JS/CSS/gambar/font) di-precache: sekali download, setelahnya load cepat walau dari cache.
- Data dari `/api/*` **tidak pernah di-cache**, selalu fresh dari database.
- Di mode `npm run dev`, PWA dinonaktifkan.

---

## Akun Demo

Semua password `himasta123`:

| Role | Login |
|---|---|
| BPH | `bph@himasta.id` |
| Kadiv PSDM | `kadiv.psdm@himasta.id` |
| Kadiv RION | `kadiv.rion@himasta.id` |
| Anggota | `anggota.rion@himasta.id` |
| Dosen | `dosen@himasta.id` |

Login Google hanya bisa untuk email yang **sudah terdaftar** di portal.

---

## Perintah Harian

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan app dev (hot reload, plus tunnel) |
| `npm run build` | Production build (compile + type + lint, generate PWA) |
| `npm run start` | Jalankan hasil build (plus tunnel) |
| `npm run typecheck` | Cek type TypeScript saja |
| `npm run lint` | Cek ESLint |
| `npx prisma db push` | Sinkronkan schema ke DB |
| `npx prisma studio` | Lihat/edit data via UI Prisma |
| `npm run db:seed` | Isi data demo utama (idempotent) |
| `npm run db:seed:dummy` | Isi data dummy besar (tes analytics/periode) |

---

## Troubleshooting

### `P1001 Can't reach database server`
Supabase Cloud tidak bisa dijangkau. Cek koneksi internet, pastikan `DATABASE_URL` dan `DIRECT_URL` di `.env` benar.

### `FATAL: no tenant identifier provided (external_id or sni_hostname required)`
Koneksi Prisma tidak memakai pooler dengan benar. Pastikan `DATABASE_URL` memakai port `6543` + `pgbouncer=true`, dan `DIRECT_URL` (port `5432`) terisi di `.env`.

### Login gagal di app tapi akun ada
Pastikan sudah seed (`npm run db:seed`). Password default `himasta123`. Role BPH satu-satunya yang bisa kelola user.

### OAuth Google error `redirect_uri_mismatch` atau callback salah
Pastikan `NEXTAUTH_URL` di `.env.local` sama persis dengan domain yang diakses, dan URL callback (`/api/auth/callback/google`) sudah didaftarkan di Google Cloud Console.

### Upload dokumen gagal "bucket not found"
Bucket `documents` belum dibuat di Supabase Storage. Lihat Setup Awal langkah 5.

### Tunnel tidak menyala
Cek: `cloudflared` terinstall, `~/.cloudflared/config.yml` ada, tunnel terdaftar (`cloudflared tunnel list`), dan DNS domain mengarah ke tunnel. Kalau masih gagal, gunakan `TUNNEL_DISABLED=1 npm run dev` untuk dev lokal.

### Error `DATABASE_URL` saat `npx prisma db push`
Prisma CLI membaca `.env`, bukan `.env.local`. Pastikan `.env` ada dan terisi.

---

## Catatan Penting

- **Jangan commit `.env` / `.env.local`** berisi key. `.gitignore` sudah mencakupnya.
- **Ganti secret default dan key Supabase** sebelum production.
- Semua halaman & API diproteksi auth (kecuali `/login`) butuh session. Role: `ANGGOTA`, `KADIV`, `BPH`, `DOSEN`.
- PWA meng-cache aset UI di browser; data API selalu diambil fresh.

---

## Roadmap

- **V1 (selesai):** auth, portal info, workspace divisi, absensi QR, arsip dokumen, direktori, notifikasi in-app, admin (approval + kelola user).
- **V2:** proker + task, sistem perizinan, event management, kalender, push notification, anggaran ringan. Lihat `PLAN/PRD_V2.md`.
- **V3:** regenerasi periode, analytics, search lanjutan, diskusi divisi, integrasi Google. Lihat `PLAN/PRD_V3.md`.

Dokumen perancangan: `PLAN/PRD.md`, `PLAN/PRD_V2.md`, `PLAN/PRD_V3.md`, `PLAN/TDD.md`.
