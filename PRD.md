# PRD — Sistem Informasi & Operasional HIMASTA (Versi 1 / MVP)

> **Status:** Draft | **Versi:** 1.0 | **Terakhir diperbarui:** 2026-08-02

---

## 1. Latar Belakang & Masalah

HIMASTA (Himpunan Mahasiswa Sains Data) saat ini menjalankan seluruh aktivitas organisasi lewat WhatsApp — media komunikasi pribadi yang tidak dirancang untuk kebutuhan formal organisasi. Ini menyebabkan:

- **Informasi tercecer** — pengumuman, info beasiswa, jadwal ujian hilang di tengah chat, tidak ada satu sumber rujukan.
- **Absensi manual** — tanda tangan kertas saat rapat, rawan hilang, sulit direkap.
- **Dokumentasi tidak transparan** — notulen, LPJ, proposal tersebar dan sulit diakses ulang.
- **Tidak ada wadah terstruktur** — tiap divisi (BPH, PSDM, RION, PR, KOMINFO) tidak punya ruang kerja terpisah untuk aktivitas masing-masing.

## 2. Tujuan Produk

Membangun aplikasi berbasis PWA sebagai **tools operasional internal** HIMASTA — bukan pengganti komunikasi informal, tapi pengganti fungsi formal yang selama ini dipaksakan lewat WhatsApp.

**Tujuan V1 secara spesifik:**
1. Satu sumber informasi resmi (general + per divisi)
2. Absensi digital via QR menggantikan tanda tangan manual
3. Arsip dokumentasi yang bisa diakses semua anggota
4. Ruang kerja (workspace) terpisah per divisi

## 3. Target Pengguna

| Role | Deskripsi | Kebutuhan utama |
|---|---|---|
| Anggota | Semua anggota HIMASTA aktif | Lihat info, absen, akses workspace divisinya |
| Kadiv/Pengurus | Ketua/pengurus tiap divisi (BPH, PSDM, RION, PR, KOMINFO) | Kelola konten & absensi divisi |
| BPH | Badan Pengurus Harian | Approval konten, kelola anggota, lihat semua divisi |
| Dosen | Dosen program studi | Akses terbatas — lihat pengumuman/laporan resmi (read-only) |

## 4. Prinsip Scope V1

- Fokus **operasional inti**, bukan fitur baru/novelty
- Modul bersifat generic & reusable, di-scope per divisi (bukan modul custom tiap divisi)
- Fitur komunikasi/diskusi real-time **tidak masuk V1** (fase 2)
- Keuangan penuh **tidak masuk V1** (di luar scope produk ini)

## 5. Fitur V1 (MVP)

### 5.1 Autentikasi & Profil
- Login (mahasiswa via NIM, dosen via akun terpisah)
- Profil anggota: nama, NIM, divisi, jabatan, kontak, foto
- Role: Anggota / Kadiv / BPH / Dosen
- Assignment anggota ke divisi (dikelola BPH)

### 5.2 Portal Informasi
- Feed pengumuman — general (semua lihat) & per divisi (scoped)
- Kategori: event, beasiswa, akademik, organisasi
- Target audience per post (semua / divisi tertentu / dosen)
- Arsip pengumuman lama

### 5.3 Divisi Workspace
- Halaman khusus per divisi (BPH, PSDM, RION, PR, KOMINFO)
- Anggota hanya lihat workspace divisinya sendiri + halaman general
- BPH bisa lihat semua workspace divisi
- Berisi: pengumuman internal, notulen, absensi rapat divisi

### 5.4 Absensi QR (Internal)
- Kadiv/BPH generate QR per sesi rapat
- Anggota scan via kamera device (browser, tanpa app native)
- Absensi otomatis tercatat ke akun anggota
- Riwayat kehadiran personal (anggota bisa cek attendance sendiri)
- Rekap kehadiran per anggota/divisi (untuk kadiv & BPH)

> Absensi eksternal (peserta non-anggota untuk event besar/seminar) — **masuk V2**, karena butuh flow terpisah (form tanpa akun, sertifikat).

### 5.5 Arsip Dokumen Dasar
- Upload & simpan notulen rapat per divisi
- Kategorisasi ringan (jenis dokumen, divisi, tanggal)
- Semua anggota bisa akses dokumen non-rahasia
- Belum ada search canggih (masuk V3)

### 5.6 Direktori Organisasi
- Struktur organisasi (BPH → 5 divisi → anggota)
- Kontak/PIC per divisi

### 5.7 Notifikasi Dasar
- In-app notification center (pengumuman baru, dll)
- Push notification **belum** di V1 (masuk V2, karena butuh setup lebih & keterbatasan iOS Safari)

## 6. Di Luar Scope V1

Fitur berikut sengaja ditunda ke V2/V3, dicatat di sini supaya tidak masuk tanpa sadar (scope creep):

| Fitur | Alasan ditunda |
|---|---|
| Proker tracking + approval | Butuh fondasi keanggotaan & divisi jalan dulu (V2) |
| Sistem perizinan (izin rapat) | Terhubung ke absensi, tapi bukan blocker awal (V2) |
| Event management + absensi eksternal + sertifikat | Flow terpisah, kompleksitas lebih tinggi (V2) |
| Kalender terpusat | Nice-to-have, bukan blocker (V2) |
| Push notification | Kompleksitas setup + keterbatasan iOS (V2) |
| Anggaran/keuangan | Sensitif, butuh approval berlapis sendiri (V2 ringan, penuh tidak masuk roadmap V1-V3) |
| Komunikasi/diskusi per divisi | Bukan pengganti WA, pelengkap — fase 2 |
| Search lanjutan, analytics, regenerasi anggota, feedback/evaluasi | Butuh data historis dulu (V3) |

## 7. Alur Utama (User Flow)

**Login → Cek Role → Landing sesuai role:**
- Anggota → Info umum + Workspace divisi + Scan absensi
- Kadiv → + Kelola divisi + Generate QR rapat
- BPH → + Approval center + Post pengumuman general + Kelola anggota
- Dosen → Lihat laporan & pengumuman resmi (read-only)

**Alur absensi rapat:**
1. Kadiv/BPH buat sesi rapat → generate QR
2. Anggota buka app → scan QR via kamera
3. Sistem catat kehadiran ke akun anggota
4. Rekap otomatis tersedia untuk kadiv/BPH

**Alur approval konten (V1 disederhanakan):**
- Post ke workspace divisi sendiri → langsung tayang (kadiv/BPH divisi)
- Post ke general (lintas divisi) → perlu approval BPH sebelum tayang

## 8. Kriteria Sukses V1

- Semua anggota HIMASTA bisa login dan akses workspace divisinya
- Minimal 1 periode rapat (misal 1 bulan) tercatat penuh via absensi QR, tanpa tanda tangan manual
- Pengumuman resmi HIMASTA terpusat di app, bukan lagi tersebar di WA grup berbeda-beda
- Minimal 1 set notulen/dokumen per divisi tersimpan & bisa diakses ulang oleh anggota

## 9. Batasan & Risiko

| Risiko | Mitigasi |
|---|---|
| Adopsi rendah — anggota tetap pakai WA | Sosialisasi + pastikan info penting HANYA ada di app, bukan didobelkan ke WA |
| Push notification tidak jalan optimal di iOS | V1 pakai in-app notification dulu, push masuk V2 setelah dicek device mayoritas anggota |
| Dikerjakan solo sambil kuliah + proyek lain | Scope V1 dijaga ketat sesuai dokumen ini — resist godaan nambah fitur V2/V3 duluan |
| Data anggota & absensi butuh akurasi tinggi | Role BPH sebagai satu-satunya pengelola assignment divisi & data anggota |

## 10. Pertanyaan Terbuka

- Absensi rapat: siapa yang generate QR jika kadiv berhalangan — ada delegasi ke anggota lain?
- Dokumen "non-rahasia" — perlu definisi jelas mana yang publik ke semua anggota vs hanya divisi terkait
- Dosen: pengumuman resmi seperti apa yang perlu mereka lihat — perlu daftar konkret dari HIMASTA

---

**Referensi terkait:** roadmap fitur lengkap V1-V3 dan diagram alur user tersedia dari sesi perencanaan sebelumnya.
