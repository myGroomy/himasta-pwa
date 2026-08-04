# PRD Sistem Informasi & Operasional HIMASTA (Versi 2)

> **Status:** Draft | **Versi:** 2.0 | **Terakhir diperbarui:** 2026-08-02
> **Prasyarat:** V1 sudah berjalan (autentikasi, portal info, workspace divisi, absensi internal, arsip dasar)

---

## 1. Latar Belakang

V1 membenahi 4 masalah inti (info tercecer, absensi manual, dokumentasi tidak transparan, tidak ada wadah). Setelah fondasi ini jalan, HIMASTA butuh app jadi **alat kerja pengurus** yang sesungguhnya bukan cuma portal info & absensi, tapi tempat proker dikelola, event besar dijalankan, dan izin/approval punya jejak jelas.

## 2. Tujuan Produk V2

1. Proker punya siklus hidup jelas: ajukan → approve → jalan → selesai, dengan jejak siapa mengerjakan apa
2. Event besar (seminar, workshop) bisa dikelola penuh termasuk peserta non-anggota
3. Ketidakhadiran rapat punya alur izin, bukan sekadar tercatat "tidak hadir"
4. Semua kegiatan organisasi terlihat dalam satu kalender
5. Reminder & pengumuman sampai ke anggota tanpa mereka harus buka app duluan (push notification)

## 3. Fitur V2

### 3.1 Program Kerja (Proker)
- Pengajuan proker baru oleh kadiv → **approval BPH** wajib di tahap pengajuan awal
- Setelah disetujui, pengelolaan detail (timeline, task) otonomi penuh kadiv/divisi tidak perlu approval BPH lagi per langkah
- Status: Rencana → Berjalan → Selesai → Dibatalkan
- Field: nama proker, deskripsi, timeline, PJ, estimasi anggaran (lihat 3.6)
- Update progress oleh kadiv, terlihat oleh BPH (monitoring, bukan approval berlapis)
- Dashboard proker: per divisi (kadiv) dan lintas divisi (BPH)

### 3.2 Task Personal
- Breakdown proker jadi task, assign ke anggota tertentu
- Anggota lihat task miliknya sendiri (to-do)
- Status task: belum/berjalan/selesai menggerakkan progress proker induk

### 3.3 Sistem Perizinan
- Anggota ajukan izin tidak hadir sebelum rapat/kegiatan berlangsung
- Kadiv approve/reject izin
- Rekap kehadiran V1 diperluas: Hadir / Izin (disetujui) / Tanpa keterangan bukan cuma hadir/tidak
- Riwayat izin personal per anggota

### 3.4 Event Management Penuh
- Buat event: BPH (general/publik) atau divisi (internal → perlu approval BPH kalau mau go-public)
- Detail event: waktu, lokasi, deskripsi, kapasitas
- Pendaftaran peserta:
  - **Anggota HIMASTA** terhubung ke akun, absensi via QR seperti rapat
  - **Non-anggota/eksternal** form pendaftaran tanpa akun, absensi via QR terpisah (untuk keperluan sertifikat/konsumsi)
- Generate sertifikat otomatis (template + data absensi peserta)

### 3.5 Kalender Terpusat
- Gabungan semua kegiatan: rapat, proker, event general & seluruh divisi
- Filter tampilan per divisi
- Sumber data: otomatis dari modul proker & event (bukan input manual terpisah)

### 3.6 Anggaran Ringan (bukan keuangan penuh)
- Tiap proker punya field: estimasi anggaran & realisasi anggaran
- Laporan sederhana per proker/divisi
- **Bukan** sistem kas masuk-keluar organisasi, bukan approval bendahara berlapis itu di luar scope V1-V3

### 3.7 Push Notification
- Reminder rapat/event mendekati waktu
- Notifikasi pengumuman baru & deadline proker
- Preferensi notifikasi per kategori (anggota bisa mute kategori tertentu)
- **Catatan teknis:** push notification PWA di iOS baru didukung sejak iOS 16.4+ cek distribusi device anggota HIMASTA sebelum full-commit ke fitur ini; siapkan in-app notification (sudah ada di V1) sebagai fallback

### 3.8 Admin & Approval Center
- Satu tempat BPH lihat semua antrian approval: proker baru, event go-public, izin (jika didesain butuh approval BPH default izin cukup approval kadiv, lihat 3.3), konten ke general
- Log aktivitas dasar: siapa approve apa, kapan

## 4. Di Luar Scope V2

| Fitur | Kenapa tetap ditunda |
|---|---|
| Regenerasi anggota & pergantian periode | Butuh data historis V1+V2 berjalan dulu (V3) |
| Feedback & evaluasi (survey, post-mortem proker) | Perlu proker & event V2 jalan dulu supaya ada objek yang dievaluasi (V3) |
| Search lanjutan lintas modul | V1 arsip masih kategorisasi ringan, search penuh nunggu volume data lebih besar (V3) |
| Laporan & analytics (dashboard keaktifan lintas divisi) | Butuh minimal 1-2 periode data proker/absensi supaya bermakna (V3) |
| Komunikasi/diskusi per divisi | Tetap fase 2 terpisah bukan prioritas V2, kompleksitas real-time tinggi |
| Keuangan penuh (kas organisasi) | Di luar scope produk ini secara keseluruhan, bukan cuma ditunda |
| Integrasi eksternal (Google Calendar/Drive sync) | Nice-to-have, nunggu V3 |

## 5. Perubahan/Perluasan atas Modul V1

| Modul V1 | Perluasan di V2 |
|---|---|
| Absensi QR (internal saja) | + Absensi eksternal untuk event, + status Izin |
| Notifikasi (in-app saja) | + Push notification |
| Arsip dokumen dasar | (tidak berubah signifikan, tetap tunggu V3 untuk search) |
| Approval hanya untuk konten general | + Approval untuk proker & event go-public, terpusat di Approval Center |

## 6. Alur Utama Baru

**Alur proker:**
1. Kadiv ajukan proker → masuk antrian approval BPH
2. BPH approve/reject
3. Jika approved → kadiv kelola detail (timeline, task, anggaran) otonom
4. Kadiv update progress → BPH monitoring via dashboard (tanpa approval ulang)

**Alur izin:**
1. Anggota ajukan izin sebelum rapat/kegiatan
2. Kadiv approve/reject
3. Status kehadiran anggota tercatat sesuai (Izin disetujui ≠ Tanpa keterangan)

**Alur event besar (seminar dsb):**
1. Divisi/BPH buat event, isi detail
2. Jika dibuat divisi & sifatnya publik → approval BPH dulu sebelum tayang ke general
3. Peserta daftar (anggota via akun, eksternal via form)
4. Hari-H: kedua jenis peserta absen via QR (jalur terpisah)
5. Sertifikat digenerate otomatis dari data absensi

## 7. Kriteria Sukses V2

- Minimal 1 siklus proker penuh (ajukan → approve → jalan → selesai) tercatat di app untuk tiap divisi
- Minimal 1 event besar HIMASTA terselenggara dengan absensi + sertifikat otomatis lewat app, tanpa Excel/Google Form manual terpisah
- Rekap kehadiran rapat membedakan Izin vs Tanpa keterangan secara otomatis
- BPH bisa melihat status seluruh proker lintas divisi dalam satu dashboard, tanpa perlu tanya manual ke tiap kadiv

## 8. Risiko

| Risiko | Mitigasi |
|---|---|
| Approval proker jadi bottleneck kalau BPH lambat respons | Approval Center (3.8) buat antrian jelas + notifikasi ke BPH saat ada pengajuan baru |
| Sertifikat otomatis salah data (nama/kehadiran) | Validasi absensi sebelum tombol generate sertifikat ditekan, bukan otomatis instan |
| Push notification tidak konsisten di iOS | In-app notification tetap jadi sumber utama, push sebagai pelengkap bukan satu-satunya kanal |
| Anggaran ringan disalahartikan sebagai sistem keuangan resmi | Perlu penegasan ke pengguna: ini estimasi kerja proker, bukan laporan keuangan HIMASTA |

## 9. Pertanyaan Terbuka

- Izin: apakah tetap perlu approval BPH untuk kasus tertentu (misal izin BPH sendiri), atau kadiv/rekan divisi cukup?
- Sertifikat: templatenya seragam HIMASTA atau bisa custom per event/divisi?
- Anggaran ringan proker: siapa yang input realisasi kadiv sendiri, atau perlu konfirmasi bendahara HIMASTA (di luar sistem, manual)?

---

**Referensi terkait:** PRD V1 (fondasi), roadmap fitur lengkap V1-V3.
