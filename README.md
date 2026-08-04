# HIMASTA Sistem Informasi & Operasional

PWA berbasis Next.js 14 untuk operasional internal HIMASTA (portal info, absensi QR, arsip dokumen, workspace divisi).

## Arsitektur: 2 Layanan

```
┌───────────────────────────┐     ┌──────────────────────────────┐
│  A. App HIMASTA (Next.js) │     │  B. Supabase Docker (Lokal)  │
│  http://localhost:3000    │     │  - Postgres  : localhost:54322│
│  .env.local               │────▶│  - API/Studio: localhost:8000 │
└───────────────────────────┘     │  - Storage   : via Studio     │
                                  └──────────────────────────────┘
```

- **A. App** kode aplikasi (`app/`, `components/`, `lib/`, `prisma/`). Di folder proyek ini.
- **B. Supabase** database + storage + studio, jalan sebagai container Docker di `~/supabase/docker`. Postgres diakses langsung via port **54322** (bukan 5432/6543 yang itu pooler Supavisor itu minta tenant id dan bikin Prisma error).

---

## Prasyarat Sistem

Pastikan semua terinstall sebelum lanjut:

```bash
node --version    # v18 atau lebih baru (lihat .nvmrc)
npm --version     # v9 atau lebih baru
docker --version  # Docker Desktop / Docker Engine
git --version
```

Windows: install **Docker Desktop** dan pastikan berjalan (WSL2 atau Hyper-V backend). Setelah install, jalankan ulang terminal.

---

## Mulai dari Nol (Setiap Kali Ingin Coding/Debug)

> **Asumsi:** Supabase sudah pernah di-setup sekali (lihat **Setup Supabase Docker** di bawah). Untuk install pertama, ikuti urutan setup dulu, baru bagian ini.

Urutan penting. Jalankan satu per satu.

### Langkah 1 Nyalakan Supabase

```bash
cd ~/supabase/docker
docker compose up -d
```

Cek semua container healthy (harus ada `supabase-db`, `supabase-studio`, `supabase-pooler`, dll):

```bash
docker ps
```

> **Tips:** Kalau container tidak jalan karena port bentrok (54322/8000/5432), cek dulu apa yang pakai port: `netstat -ano | grep 54322` (Windows) / `ss -tlnp | grep 54322` (Linux).

### Langkah 2 Nyalakan App

```bash
cd "/mnt/d/1. MAIN FILE_Taufik/Downloads/Download Brave/HIMASTA"
npm run dev
```

Buka **http://localhost:3000**.

---

## Setup Supabase Docker (Pertama Kali, Machine Baru)

> Ini hanya dilakukan **sekali** per machine. Setelahnya cukup `docker compose up -d`.

### 1. Clone repo Supabase Docker

```bash
git clone https://github.com/supabase/docker.git ~/supabase/docker
cd ~/supabase/docker
```

### 2. Buat file `.env`

```bash
cp .env.example .env
```

Buka `.env`, cari dan set **`POSTGRES_PASSWORD`** pilih password kuat, **simpan** karena dipakai di `DATABASE_URL` app. (Default sudah ada, tapi sebaiknya ganti.)

Catat juga nilai **`ANON_KEY`** dan **`SERVICE_ROLE_KEY`** dipakai di env app nanti.

### 3. Expose port Postgres langsung (wajib!)

Buka `docker-compose.yml`, cari service `db:` dan tambahkan blok `ports:`:

```yaml
  db:
    container_name: supabase-db
    image: supabase/postgres:17.6.1.136
    restart: unless-stopped
    ports:               # <-- tambahkan ini
      - "54322:5432"     # <-- akses langsung postgres, bypass supavisor
    volumes:
      ...
```

> **Kenapa?** Default Supabase mengekspos `5432`/`6543` lewat Supavisor (pooler) yang butuh "tenant id" Prisma gagal konek dengan error `no tenant identifier provided`. Port `54322` terhubung langsung ke container postgres, tanpa pooler.

### 4. Nyalakan dan verifikasi

```bash
docker compose up -d
docker ps    # semua container status "healthy" / "Up"
```

Supabase Studio: **http://localhost:8000** (login `supabase` / password = `DASHBOARD_PASSWORD` di `.env`).

---

## Setup Awal App (Hanya Sekali, Saat Instalasi Baru / Repo Baru)

### 1. Install dependencies

```bash
cd "/mnt/d/1. MAIN FILE_Taufik/Downloads/Download Brave/HIMASTA"
npm install        # atau pnpm install
```

### 2. Set environment variables

Buat file `.env` dan `.env.local` (keduanya wajib `.env` dipakai Prisma CLI, `.env.local` dipakai Next.js). Salin dari template:

```bash
cp .env.example .env
cp .env.example .env.local
```

Isi nilainya:

```env
# PostgreSQL langsung (bypass supavisor), port 54322 di-expose di docker-compose db service
DATABASE_URL="postgresql://postgres:POSTGRES_PASSWORD@127.0.0.1:54322/postgres?schema=public"

# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="<random-long-string>"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<ANON_KEY dari ~/supabase/docker/.env>"
SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY dari ~/supabase/docker/.env>"
```

Ganti `POSTGRES_PASSWORD` dengan yang kamu set di `.env` Supabase. **Jangan pernah commit key asli ke git.**

### 3. Sinkronkan schema ke database

```bash
npx prisma db push
```

Membuat semua tabel dari `prisma/schema.prisma` ke Postgres lokal. Aman dijalankan ulang.

### 4. Seed data demo (idempotent aman dijalankan ulang)

```bash
npm run db:seed
```

Isi: 5 divisi, 10 user demo, pengumuman contoh, sesi absensi + rekap, dokumen contoh.

**Akun demo** (semua password `himasta123`):

| Role | Login |
|---|---|
| BPH | `bph@himasta.id` |
| Kadiv PSDM | `kadiv.psdm@himasta.id` |
| Kadiv RION | `kadiv.rion@himasta.id` |
| Anggota | `anggota.rion@himasta.id` |
| Dosen | `dosen@himasta.id` |

### 5. Buat Storage bucket `documents` (sekali, lewat UI Studio)

1. Buka **http://localhost:8000**
2. Login Studio: `supabase` / `DASHBOARD_PASSWORD` dari `~/supabase/docker/.env`
3. **Storage → New bucket** → nama: `documents` → centang **Public**
4. Selesai.

> Wajib sebelum upload dokumen beneran. App menulis ke bucket `documents` (`lib/storage.ts`).

### 6. Verifikasi selesai

1. `npm run dev` → buka **http://localhost:3000** → login `bph@himasta.id` / `himasta123`
2. Lihat pengumuman contoh di halaman utama → artinya DB + auth jalan.
3. Buka **http://localhost:8000** → Table Editor → cek tabel `User`, `Announcement`, `ApprovalLog` ada.

---

## Perintah Harian

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan app dev (hot reload) |
| `npm run build` | Production build (cek compile + type + lint) |
| `npm run start` | Jalankan hasil build (setelah `build`) |
| `npm run typecheck` | Cek type TypeScript saja |
| `npm run lint` | Cek ESLint |
| `npx prisma db push` | Sinkronkan schema ke DB |
| `npx prisma studio` | Lihat/edit data via UI Prisma |
| `npm run db:seed` | Isi data demo (idempotent) |
| `docker compose up -d` | Nyalakan Supabase (dari `~/supabase/docker`) |
| `docker compose down` | Matikan Supabase |

---

## Troubleshooting

### `P1001 Can't reach database server at 127.0.0.1:54322`
Supabase belum jalan / container `db` mati. → `cd ~/supabase/docker && docker compose up -d`.

### `FATAL: no tenant identifier provided (external_id or sni_hostname required)`
URL masih ke pooler (`5432`/`6543`). **Ganti port ke `54322`** dan hapus param `pgbouncer=true`. Kalau fresh clone dan port 54322 belum ada, ikuti **Setup Supabase Docker langkah 3** (tambahkan `ports: - "54322:5432"` di service `db:`), lalu `docker compose up -d db`.

### Login gagal di app tapi akun ada
Pastikan sudah seed. Password default `himasta123`. Role BPH = satu-satunya yang bisa kelola user.

### Upload dokumen gagal "bucket not found"
Bucket `documents` belum dibuat di Studio. Lihat langkah Setup App 5.

### Error `DATABASE_URL` saat `npx prisma db push`
Prisma CLI baca `.env`, bukan `.env.local`. Pastikan `.env` ada.

### `docker compose up` error port sudah dipakai
Ada container/proses lain yang pakai port 54322/8000. Cek `docker ps`, matikan yang bentrok, atau ubah port di compose (dan sesuaikan `.env` app).

---

## Catatan Penting

- **Jangan commit `.env` / `.env.local`** berisi key. `.gitignore` sudah mencakupnya.
- **Ganti password & key default Supabase** sebelum production. Ini setup dev lokal.
- App diproteksi auth semua halaman & API (kecuali `/login`) butuh session. Role: `ANGGOTA`, `KADIV`, `BPH`, `DOSEN`.
- Rate limiter & security headers sudah aktif (in-memory cukup untuk 1 instance dev).

---

## Roadmap

- **V1 (selesai):** auth, portal info, workspace divisi, absensi QR, arsip dokumen, direktori, notifikasi in-app, admin (approval + kelola user).
- **V2:** proker + task, sistem perizinan, event management, kalender, push notification, anggaran ringan. Lihat `PLAN/PRD_V2.md`.
- **V3:** regenerasi periode, analytics, search lanjutan, diskusi divisi, integrasi Google. Lihat `PLAN/PRD_V3.md`.

Dokumen perancangan: `PLAN/PRD.md`, `PLAN/PRD_V2.md`, `PLAN/PRD_V3.md`, `PLAN/TDD.md`.
