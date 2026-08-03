# PRD — Sistem Informasi & Operasional HIMASTA (Versi 3)

> **Status:** Draft | **Versi:** 3.0 | **Terakhir diperbarui:** 2026-08-02
> **Prasyarat:** V1 & V2 sudah berjalan minimal 1-2 periode kepengurusan (butuh data historis supaya fitur V3 bermakna)

---

## 1. Latar Belakang

V1 membangun fondasi (info, absensi, arsip, workspace divisi). V2 menjadikannya alat kerja operasional penuh (proker, event, izin, approval). V3 adalah fase **maturity** — mengubah app dari "alat kerja harian" jadi sistem yang punya insight dan bertahan lintas pergantian kepengurusan, bukan cuma dipakai 1 periode lalu ditinggal.

**Perbedaan mendasar V3 dari V1/V2:** fitur di sini butuh data historis untuk berguna. Analytics tanpa data 1-2 periode tidak ada artinya; regenerasi anggota tanpa siklus kepengurusan yang sudah berjalan tidak punya konteks untuk diuji.

## 2. Tujuan Produk V3

1. App bisa dipakai lintas periode kepengurusan tanpa kehilangan data atau berantakan saat pergantian pengurus
2. BPH & kadiv punya insight terukur (bukan cuma tracking manual) atas kehadiran, keaktifan, dan progress proker
3. Ada mekanisme evaluasi terstruktur setelah event/proker, bukan cuma "jalan lalu lupa"
4. Dokumen & informasi mudah ditemukan meski volumenya sudah besar
5. Mengurangi kerja duplikat dengan tools lain yang sudah dipakai (Google Calendar, Drive)

## 3. Fitur V3

### 3.1 Regenerasi Anggota & Pergantian Periode
- Alur transisi resmi saat ganti kepengurusan: anggota lama → status alumni, struktur baru di-setup
- Riwayat jabatan tetap tersimpan (anggota bisa punya histori: pernah di PSDM, sekarang di RION)
- Data periode lama tidak hilang — tetap bisa diakses sebagai arsip (read-only) oleh BPH baru
- Proses onboarding anggota baru (open recruitment/maba) — form pendaftaran → assignment ke divisi

### 3.2 Feedback & Evaluasi
- Survey kepuasan setelah event (terhubung ke modul event V2)
- Evaluasi proker sederhana (post-mortem): apa yang berhasil/gagal, dicatat kadiv setelah proker selesai
- Kritik-saran ke BPH, dengan opsi anonim
- Hasil evaluasi jadi bagian dari LPJ (terhubung ke arsip dokumen V1)

### 3.3 Laporan & Analytics
- Dashboard BPH: statistik kehadiran lintas divisi per periode
- Statistik keaktifan anggota (frekuensi hadir, task selesai, kontribusi proker)
- Progress proker keseluruhan — visual, bukan cuma daftar status
- Perbandingan antar periode (jika data 2+ periode tersedia)

### 3.4 Search Lanjutan
- Pencarian lintas modul: dokumen, pengumuman, proker, event — satu search bar
- Filter berdasarkan divisi, periode, kategori, tanggal
- Menggantikan kebutuhan scroll manual yang mulai tidak efisien setelah volume data V1-V2 menumpuk

### 3.5 Komunikasi/Diskusi per Divisi (Fase 2 — akhirnya direalisasi)
- Thread diskusi internal per divisi
- Sifatnya pelengkap formal, bukan pengganti WA sepenuhnya
- Notifikasi thread baru (terhubung ke sistem notifikasi V2)

### 3.6 Integrasi Eksternal
- Sinkronisasi kalender HIMASTA (V2) ke Google Calendar pribadi anggota (opsional, per anggota)
- Link dokumen dari Google Drive eksisting HIMASTA (kalau ada) daripada re-upload ulang semua arsip lama
- Export data tabular ke Excel — anggota, proker, rekap kehadiran, dll (untuk kebutuhan laporan resmi ke luar sistem)

## 4. Fitur yang Sengaja Tidak Pernah Masuk Roadmap

Berbeda dari V1/V2 yang menunda fitur ke fase berikutnya, berikut yang **secara sadar di luar scope produk ini** meski sampai V3:

| Fitur | Alasan |
|---|---|
| Keuangan/kas organisasi penuh (approval bendahara berlapis, laporan keuangan resmi) | Domain sensitif, butuh sistem terpisah dengan audit trail sendiri — bukan bagian dari tools operasional ini |
| Gamifikasi (badge, leaderboard) | Nice-to-have yang tidak menjawab masalah inti (info tercecer, absensi manual, dokumentasi tidak transparan) |
| Native mobile app (iOS/Android store) | PWA sudah cukup untuk skala organisasi kampus; native app menambah biaya (developer account) tanpa value sepadan |

## 5. Perubahan/Perluasan atas Modul V1 & V2

| Modul sebelumnya | Perluasan di V3 |
|---|---|
| Arsip dokumen (V1) | + Search lanjutan lintas modul |
| Absensi & rekap (V1/V2) | + Analytics & perbandingan antar periode |
| Event (V2) | + Survey kepuasan pasca-event |
| Proker (V2) | + Evaluasi/post-mortem terstruktur |
| Keanggotaan (V1) | + Alur regenerasi & onboarding resmi |
| Kalender (V2) | + Sinkronisasi ke Google Calendar |

## 6. Alur Utama Baru

**Alur pergantian periode:**
1. BPH lama tandai periode berakhir
2. Sistem migrasikan anggota lama → status alumni (riwayat jabatan tersimpan)
3. BPH baru setup struktur baru (assignment kadiv/anggota ke divisi)
4. Data periode lama tetap ada, read-only, bisa diakses sebagai arsip historis

**Alur evaluasi proker:**
1. Proker berstatus "Selesai" (dari V2)
2. Sistem prompt kadiv untuk isi evaluasi singkat
3. Evaluasi tersimpan, terhubung ke dokumen LPJ periode tersebut

**Alur onboarding anggota baru:**
1. Form pendaftaran terbuka (open recruitment)
2. Kandidat isi data diri
3. BPH/PSDM assign ke divisi
4. Anggota baru otomatis dapat akses sesuai role Anggota (V1)

## 7. Kriteria Sukses V3

- Minimal 1 pergantian periode kepengurusan berhasil dilakukan lewat app tanpa kehilangan data lama
- BPH bisa melihat dashboard analytics (kehadiran & progress proker) tanpa rekap manual di Excel terpisah
- Minimal 1 siklus evaluasi (survey event + post-mortem proker) terisi dan jadi bagian LPJ
- Search lintas modul mengembalikan hasil relevan dalam volume data 1-2 periode penuh

## 8. Risiko

| Risiko | Mitigasi |
|---|---|
| Migrasi data pergantian periode error/data hilang | Wajib backup penuh sebelum migrasi, alur migrasi diuji dulu di data dummy sebelum dipakai beneran |
| Analytics disalahartikan sebagai penilaian kinerja individu | Framing dashboard sebagai insight organisasi, bukan alat penilaian personal — hindari fitur seperti ranking individu |
| Search lambat kalau volume data besar tanpa optimasi | Perlu indexing yang tepat sejak awal implementasi, bukan ditambah belakangan |
| Integrasi Google Calendar/Drive nambah kompleksitas auth (OAuth) | Jadikan benar-benar opsional per anggota, bukan wajib — jangan blocking alur utama app kalau integrasi gagal |

## 9. Pertanyaan Terbuka

- Data alumni: berapa lama disimpan aktif sebelum diarsipkan total (kalau ada batas penyimpanan/kebijakan privasi)?
- Evaluasi anonim: siapa yang bisa lihat hasilnya — BPH periode berjalan saja, atau juga BPH periode berikutnya sebagai referensi?
- Search: prioritas dokumen apa yang paling sering dicari anggota — ini menentukan bobot relevansi hasil pencarian?

---

**Referensi terkait:** PRD V1 (fondasi), PRD V2 (operasional penuh), roadmap fitur lengkap V1-V3.
