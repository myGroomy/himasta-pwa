# Technical Design Document HIMASTA App (V1)

> **Status:** Draft | **Versi:** 1.0 | **Terakhir diperbarui:** 2026-08-02
> **Terkait:** PRD.md (V1), PRD_V2.md, PRD_V3.md

---

## 1. Ringkasan Teknis

Aplikasi PWA berbasis Next.js 14 (App Router) dengan PostgreSQL sebagai database relasional. Arsitektur monolith (frontend + backend dalam satu Next.js app) sesuai skala tim (solo developer) dan skala pengguna (~500 user).

## 2. Tech Stack

| Layer | Teknologi | Versi/Catatan |
|---|---|---|
| Framework | Next.js | 14, App Router |
| Bahasa | TypeScript | strict mode |
| Database | PostgreSQL | via Supabase |
| ORM | Prisma | schema-first |
| Auth | NextAuth.js (Auth.js) | Credentials Provider |
| PWA | @ducanh2912/next-pwa | manifest + service worker |
| File Storage | Supabase Storage | notulen, dokumen, foto profil |
| QR Generate | qrcode (npm) | sisi server |
| QR Scan | html5-qrcode | sisi client, akses kamera browser |
| UI | shadcn/ui + Tailwind CSS | komponen reusable |
| Rich Text Editor | Tiptap / BlockNote | modul notulen |
| Hosting App | Vercel | |
| Hosting DB | Supabase | Postgres + Storage satu ekosistem |

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────┐
│              Client (Browser/PWA)             │
│   Next.js App Router (Server + Client Comp)   │
└───────────────────┬───────────────────────────┘
                     │ HTTPS
┌───────────────────▼───────────────────────────┐
│         Next.js Route Handlers (API)          │
│  /api/auth  /api/announcements  /api/attendance│
│  /api/divisions  /api/documents  ...           │
└──────┬──────────────────────────┬──────────────┘
       │                          │
┌──────▼──────────┐      ┌────────▼────────────┐
│  Prisma ORM      │      │  Supabase Storage    │
│  ↓               │      │  (dokumen, foto)     │
│  PostgreSQL (DB)  │      └──────────────────────┘
└───────────────────┘
```

**Pola akses data:** Server Components untuk fetch data langsung (dashboard, feed pengumuman), Route Handlers untuk mutasi/aksi (submit absensi, generate QR, approval).

## 4. Model Peran & Otorisasi (RBAC)

| Role | Level akses |
|---|---|
| `ANGGOTA` | Baca general + workspace divisi sendiri, submit absensi, baca dokumen divisi sendiri |
| `KADIV` | + Kelola konten divisi sendiri, generate QR rapat divisi sendiri, lihat rekap divisi sendiri |
| `BPH` | + Approval konten general, kelola semua anggota & divisi, lihat semua workspace |
| `DOSEN` | Baca-saja: pengumuman resmi & laporan yang ditandai visible untuk dosen |

Otorisasi diterapkan di 2 lapis:
1. **Middleware/session check** role tersimpan di session (NextAuth callback), dicek di setiap Route Handler
2. **Row-level scoping** query Prisma selalu difilter berdasarkan `divisionId` milik user (kecuali role BPH)

## 5. Modul & Tanggung Jawab

| Modul | Route (contoh) | Deskripsi |
|---|---|---|
| Auth | `/login`, `/api/auth/*` | Login NIM/akun dosen, session |
| Portal Info | `/`, `/announcements` | Feed pengumuman general + scoped |
| Divisi Workspace | `/divisi/[slug]` | Halaman scoped per divisi |
| Absensi | `/absensi`, `/api/attendance/*` | Generate QR, scan, rekap |
| Arsip Dokumen | `/dokumen`, `/api/documents/*` | Upload, kategorisasi, baca |
| Direktori | `/direktori` | Struktur organisasi, kontak |
| Notifikasi | in-app center | Notifikasi baca/belum baca |
| Admin/Approval | `/admin/approval` (BPH only) | Approval konten general |

## 6. Struktur Folder (usulan)

```
/app
  /(auth)/login
  /(main)/page.tsx              # portal info general
  /(main)/divisi/[slug]/page.tsx
  /(main)/absensi/page.tsx
  /(main)/dokumen/page.tsx
  /(main)/direktori/page.tsx
  /(admin)/approval/page.tsx
  /api/auth/[...nextauth]/route.ts
  /api/announcements/route.ts
  /api/attendance/route.ts
  /api/attendance/[sessionId]/scan/route.ts
  /api/documents/route.ts
/lib
  /prisma.ts
  /auth.ts
  /permissions.ts                # helper cek role & scope
/components
  /ui                            # shadcn components
  /shared
/prisma
  /schema.prisma
```

## 7. Data Model Entitas Utama

Lihat detail relasi lengkap di **Bagian 8 (ERD)**. Ringkasan entitas V1:

- **User** akun (anggota/kadiv/BPH/dosen), terhubung ke Division
- **Division** 5 divisi tetap (BPH, PSDM, RION, PR, KOMINFO) BPH diperlakukan sebagai division khusus dengan hak lintas-divisi
- **Announcement** pengumuman, punya scope (general/divisi tertentu), status approval
- **AttendanceSession** sesi rapat/kegiatan, generate QR
- **AttendanceRecord** catatan kehadiran per user per sesi
- **Document** notulen/arsip, terhubung ke division & uploader

## 8. Prisma Schema (V1)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ANGGOTA
  KADIV
  BPH
  DOSEN
}

enum AnnouncementScope {
  GENERAL
  DIVISION
}

enum AnnouncementStatus {
  DRAFT
  PENDING_APPROVAL
  PUBLISHED
  REJECTED
}

enum DocumentCategory {
  NOTULEN
  PROPOSAL
  LPJ
  LAINNYA
}

model Division {
  id            String         @id @default(cuid())
  name          String         @unique   // BPH, PSDM, RION, PR, KOMINFO
  slug          String         @unique
  description   String?
  createdAt     DateTime       @default(now())

  users         User[]
  announcements Announcement[]
  documents     Document[]
  sessions      AttendanceSession[]
}

model User {
  id             String    @id @default(cuid())
  nim            String?   @unique          // null untuk dosen
  email          String    @unique
  name           String
  role           Role
  divisionId     String?
  division       Division? @relation(fields: [divisionId], references: [id])
  phone          String?
  photoUrl       String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())

  announcementsAuthored Announcement[]      @relation("AnnouncementAuthor")
  announcementsApproved Announcement[]      @relation("AnnouncementApprover")
  attendanceRecords     AttendanceRecord[]
  sessionsCreated       AttendanceSession[] @relation("SessionCreator")
  documentsUploaded     Document[]          @relation("DocumentUploader")
}

model Announcement {
  id           String              @id @default(cuid())
  title        String
  content      String
  category     String              @default("organisasi") // event | beasiswa | akademik | organisasi
  scope        AnnouncementScope
  divisionId   String?             // wajib diisi jika scope = DIVISION
  division     Division?           @relation(fields: [divisionId], references: [id])
  status       AnnouncementStatus  @default(DRAFT)
  authorId     String
  author       User                @relation("AnnouncementAuthor", fields: [authorId], references: [id])
  approvedById String?
  approvedBy   User?               @relation("AnnouncementApprover", fields: [approvedById], references: [id])
  visibleToDosen Boolean           @default(false)
  createdAt    DateTime            @default(now())
  publishedAt  DateTime?
}

model AttendanceSession {
  id          String   @id @default(cuid())
  title       String                    // contoh: "Rapat Mingguan RION #4"
  divisionId  String?                   // null jika sesi general/lintas divisi
  division    Division? @relation(fields: [divisionId], references: [id])
  qrToken     String   @unique          // token unik untuk QR
  createdById String
  createdBy   User     @relation("SessionCreator", fields: [createdById], references: [id])
  startTime   DateTime
  endTime     DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  records     AttendanceRecord[]
}

model AttendanceRecord {
  id         String             @id @default(cuid())
  sessionId  String
  session    AttendanceSession  @relation(fields: [sessionId], references: [id])
  userId     String
  user       User               @relation(fields: [userId], references: [id])
  scannedAt  DateTime           @default(now())

  @@unique([sessionId, userId])   // 1 user hanya bisa absen 1x per sesi
}

model Document {
  id          String            @id @default(cuid())
  title       String
  category    DocumentCategory
  fileUrl     String                    // path di Supabase Storage
  divisionId  String?                   // null jika dokumen general
  division    Division?         @relation(fields: [divisionId], references: [id])
  uploadedById String
  uploadedBy  User              @relation("DocumentUploader", fields: [uploadedById], references: [id])
  createdAt   DateTime          @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, isRead])
}
```

## 9. Keputusan Desain Kunci

| Keputusan | Alasan |
|---|---|
| Monolith Next.js, bukan backend terpisah | Solo development, skala 500 user tidak butuh microservices |
| `divisionId` nullable di User | Mengakomodasi BPH yang lintas-divisi & dosen yang tidak terikat divisi |
| BPH diperlakukan sebagai Division biasa di skema, bukan tabel terpisah | Konsisten & sederhana pembedaan hak akses BPH dilakukan lewat `Role`, bukan struktur tabel berbeda |
| `qrToken` unik per sesi, bukan reusable | Mencegah replay/reuse QR lama untuk absen sesi lain |
| `@@unique([sessionId, userId])` di AttendanceRecord | Mencegah user absen dobel di sesi yang sama pada level database, bukan hanya validasi aplikasi |
| Approval hanya di level Announcement (V1) | Sesuai scope PRD V1 proker/event approval baru masuk V2 |

## 10. Keamanan

- Password/credential auth di-hash (bcrypt via NextAuth Credentials Provider)
- QR token di-generate dengan expiry (`endTime` sesi) QR tidak valid setelah sesi ditutup, dicek server-side saat scan, bukan hanya client-side
- Row-level scoping dicek di setiap Route Handler user tidak bisa akses data divisi lain lewat manipulasi URL/API langsung
- File upload (Supabase Storage) divalidasi tipe & ukuran file di server sebelum diterima

## 11. Hal yang Sengaja Disederhanakan di V1

Dicatat di sini supaya jelas ini keputusan sadar, bukan kelalaian:

- Belum ada audit log terperinci (siapa edit apa kapan) baru masuk V2 di Approval Center
- Belum ada full-text search arsip dokumen V1 hanya kategorisasi manual
- Notifikasi hanya in-app, belum push keterbatasan iOS PWA push jadi pertimbangan
- Tidak ada versioning dokumen upload baru menggantikan referensi, bukan riwayat versi

## 12. Migrasi ke V2 (persiapan skema)

Skema V1 dirancang agar tabel tambahan V2 (`Proker`, `Task`, `Permission/Izin`, `Event`, `EventRegistration`) bisa ditambahkan sebagai tabel baru dengan foreign key ke `User` dan `Division` yang sudah ada tidak perlu migrasi besar/breaking change ke skema V1.

---

**Lihat Bagian 8 di atas untuk detail field.** Untuk visualisasi relasi antar tabel, lihat ERD di bagian selanjutnya (Mermaid diagram).
