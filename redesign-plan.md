# Rencana Redesain UI/UX - Minimalist Corporate (HIMASTA PWA)

Dokumen ini berisi panduan dasar desain dan kumpulan prompt terstruktur untuk men-generate **34 halaman aktual** aplikasi HIMASTA PWA menggunakan AI generator.

---

## Fondasi Desain & Gaya Visual

* **Palet Warna Terbatas (High Contrast, Low Saturation)**:
  * **Primary (Brand)**: Navy Blue Korporat (`#1E3A8A`) untuk tombol utama, teks link, status aktif, dan aksen penting.
  * **Neutrals (Latar & Border)**: Off-white/slate halus (`#F8FAFC`) untuk background halaman, putih bersih (`#FFFFFF`) untuk card/container, dan abu-abu tipis (`#E2E8F0` / `#64748B`) untuk border dan teks sekunder.
  * **Semantic (Status)**: Hijau redup/sukses (`#E6F4EA` text `#137333`), Kuning redup/peringatan (`#FEF7E0` text `#B06000`), Merah redup/error (`#FCE8E6` text `#C5221F`).
* **Tipografi**: Sans-serif bersih (Inter / Outfit / SF Pro), ukuran font terstruktur dengan kontras ketat (tidak terlalu banyak variasi ukuran font di satu halaman).
* **Tata Letak & Spacing**:
  * **PWA Mobile-First**: Semua elemen diatur untuk akses layar HP, tombol mudah diklik satu tangan (min target 48px).
  * **Margin Konsisten**: Gunakan margin minimal `16px` di setiap sisi terluar container halaman agar halaman memiliki ruang bernapas.
  * **Batas & Elevation**: Hindari bayangan (shadow) tebal atau gradasi mencolok. Gunakan border tipis `1px solid #E2E8F0` dengan radius sedang-kecil `rounded-md` atau `rounded-xl`.
  * **Ikon Konsisten**: Menggunakan Lucide React 2px stroke linear di seluruh komponen. Jangan gunakan emoji dekoratif.

---

## Kumpulan Prompt Redesain Terstruktur (Total 34 Halaman)

### 1. Fitur: Auth & Landing/Publik Flow (5 Halaman)
```text
Desainkan 5 page (Login, Register, Welcome Landing, Tentang Organisasi, dan Detail Event Publik) untuk alur onboarding dan publik aplikasi internal organisasi mahasiswa, tema minimalist corporate.

Struktur:
1. Halaman Login (/login):
   - Logo organisasi di bagian atas, ukuran sedang, center-aligned.
   - Judul singkat ("Masuk ke akun Anda" atau sejenis) dan subjudul kecil penjelas.
   - Form dengan 2 input: NIM/email, password (pakai ikon Lucide: user/mail untuk field pertama, lock untuk password, dengan toggle show/hide password pakai ikon eye/eye-off).
   - Tombol submit full-width, warna primer, dengan state loading yang jelas.
   - Link kecil di bawah form untuk "belum punya akun? daftar di sini".
   - Background halaman polos atau dengan aksen minimal (bukan foto besar/ilustrasi ramai).
2. Halaman Register (/register):
   - Form pendaftaran dengan input teratur: Nama Lengkap, NIM, Email, No. HP, Dropdown pilihan Divisi, dan Password.
   - Tombol submit solid Navy Blue "Buat Akun".
   - Link kembali ke halaman login di bagian paling bawah.
3. Welcome Landing Page (/welcome):
   - Hero section interaktif dengan deskripsi singkat organisasi sains data.
   - Aksen minimalis di latar belakang dan tombol "Masuk Portal" dan "Tentang Kami".
4. Tentang Organisasi (/welcome/tentang):
   - Layar informasi visi, misi, dan struktur BPH organisasi.
5. Detail Event Publik (/events/[id]):
   - Halaman detail untuk publik non-login untuk melihat event resmi dan tombol daftar.

Tata Letak & Spacing:
- Tampilan mobile-first terpusat dengan padding 16px di setiap sisi card.
- Sudut card/input memiliki radius sedang (rounded-md/lg).

Mood: tenang, profesional, meyakinkan — kesan "ini sistem resmi organisasi", bukan aplikasi konsumer casual.
```

### 2. Fitur: Portal Utama & Fitur Pendukung (6 Halaman)
```text
Desainkan 6 page (Halaman Portal Utama/Beranda, Notifikasi, Pencarian Global, Profil Pengguna, Kalender Organisasi, dan Direktori Anggota) serta Layout PWA mobile-first untuk organisasi mahasiswa, tema minimalist corporate.

Struktur:
1. Halaman Portal Utama (/):
   - Welcome banner berlatar putih dengan grid pattern abu-abu tipis (opacity 20%).
   - Teks sapaan "Selamat datang, [Nama]" dan info role/divisi di bawahnya.
   - Tombol cepat check-in: "Scan Kegiatan" (solid Navy, ikon QrCode) dan tombol outline "Buat Pengumuman" (hanya untuk pengurus).
   - Grid Menu Utama (Quick Navigation) 3 kolom berisi Card menu: Kegiatan, Dokumen, Proker, Izin, Event, Kalender. Card minimalis berlatar putih dengan ikon Lucide linier (2px stroke) di dalam box abu-abu tipis (#F1F5F9).
2. Halaman Notifikasi (/notifikasi):
   - List vertical notifikasi log masuk, persetujuan admin, dan info kegiatan terbaru dengan penanda belum dibaca (unread dot).
3. Halaman Pencarian Global (/search):
   - Form input pencarian cepat dilengkapi filter kategori: Pengumuman, Dokumen, Proker, Event.
4. Halaman Profil Pengguna (/profil):
   - Informasi profil pengguna, inisial avatar besar, form edit kontak (email/telepon), dan status status token QR personal.
5. Halaman Kalender Organisasi (/kalender):
   - Tampilan agenda kalender bulanan dan daftar kegiatan dekat.
6. Halaman Direktori Anggota (/direktori):
   - List daftar nama anggota aktif organisasi per divisi beserta kontaknya.

Tata Letak & Spacing:
- Margin minimal 16px di setiap sisi luar halaman (atas, bawah, kiri, kanan).
- Whitespace longgar antar section untuk estetika bersih.
- Bottom Navigation Bar melayang (floating) dengan background transparan blur (backdrop-blur-md) dan border atas tipis.

Mood: terstruktur, fungsional, andal — menyerupai dashboard SaaS B2B profesional.
```

### 3. Fitur: Feed Pengumuman (4 Halaman)
```text
Desainkan 4 page (Halaman List Pengumuman, Buat Pengumuman Baru, Detail Pengumuman, dan Edit Pengumuman) bertema minimalist corporate.

Struktur:
1. Halaman List Pengumuman (/announcements):
   - Tampilan list card pengumuman: berlatar putih dengan border tipis (border-border), badge kategori (Organisasi, Akademik, Event) dengan warna redup bernuansa elegan, avatar penulis dengan inisial nama, serta penanda waktu.
2. Halaman Buat Pengumuman Baru (/announcements/new):
   - Editor input sederhana: Judul, Scope (General/Divisi), Visibilitas Dosen (toggle), dan Rich Text Editor area.
   - Tombol "Publikasikan" dan "Simpan Draf".
3. Halaman Detail Pengumuman (/announcements/[id]):
   - Halaman detail dengan judul besar, metadata penulis & waktu di bawah judul, serta isi konten pengumuman yang bersih dengan whitespace yang luas.
4. Halaman Edit Pengumuman (/announcements/[id]/edit):
   - Formulir edit dengan data pengumuman yang sudah terisi sebelumnya untuk dimodifikasi.

Tata Letak & Spacing:
- Jarak antar elemen longgar, margin 16px di sekeliling layout.
- Border radius seragam pada card pengumuman (rounded-md/lg).

Mood: bersih, informatif, berwibawa.
```

### 4. Fitur: Kegiatan & Event (9 Halaman)
```text
Desainkan 9 page (Halaman List Kegiatan, Scan Absensi Kegiatan, List Event Internal/Publik, Buat Event Baru, Scan Absensi Event, Detail Event, Registrasi Event, Tiket Masuk QR, dan Pusat Unduh Sertifikat) bertema minimalist corporate.

Struktur:
1. Halaman List Kegiatan (/kegiatan):
   - Daftar vertikal kegiatan rapat/mubes/proker aktif dipisahkan hairline tipis.
   - Menampilkan judul kegiatan, nama divisi, jam mulai, dan status badge.
2. Halaman Scan Absensi Kegiatan (/kegiatan/scan):
   - Kamera box scanner di tengah berbingkai border target Navy untuk scan QR kegiatan.
3. Halaman List Event (/events):
   - Grid list event aktif dengan thumbnail minimalis, deskripsi, tanggal pelaksanaan, dan status approval.
4. Halaman Buat Event Baru (/events/new):
   - Form pembuatan event: Nama, Tanggal, Kapasitas, Visibilitas (Internal/Public).
5. Halaman Scan Absensi Event (/events/scan):
   - Scanner kamera khusus untuk tiket masuk event eksternal/internal.
6. Halaman Detail Event (/events/[id] - Internal):
   - Detail deskripsi internal event, daftar peserta, dan statistik kapasitas.
7. Halaman Registrasi Event (/events/[id]/register):
   - Form input Nama, Email, Instansi, No HP untuk pendaftaran event.
8. Halaman Tiket QR (Ticket View):
   - Layout e-ticket vertikal yang bersih. Logo organisasi di bagian atas, info event, nama peserta, dan QR Code di tengah.
9. Halaman Unduh Sertifikat (/events/[id]/certificate):
   - Box preview sertifikat minimalis dengan nomor sertifikat (format resmi) dan tombol Navy "Unduh Sertifikat".

Tata Letak & Spacing:
- Margin minimal 16px di seluruh sisi luar halaman.
- Tombol aksi berukuran nyaman untuk disentuh (tinggi min 48px).

Mood: efisien, responsif, andal.
```

### 5. Fitur: Program Kerja & Workspace Divisi (3 Halaman)
```text
Desainkan 3 page (Halaman Daftar Proker, Buat Proker Baru, dan Detail/Workspace Divisi) bertema minimalist corporate.

Struktur:
1. Halaman Daftar Proker (/proker):
   - Tab navigasi berdasarkan status (Rencana, Berjalan, Selesai, Dibatalkan).
   - List Proker berbentuk card putih bersih, border tipis, memuat judul proker, progress bar pengeluaran anggaran, dan nama PJ.
2. Halaman Buat Proker Baru (/proker/new):
   - Form input proker: Nama, Deskripsi, Estimasi Budget, Pilihan Divisi, dan Tanggal Rencana.
3. Halaman Detail/Workspace Divisi (/divisi/[slug]):
   - Halaman khusus per divisi yang menampilkan info pengurus divisi, dokumen divisi, proker divisi berjalan, serta ruang obrolan (discussion forum) divisi.

Tata Letak & Spacing:
- Margin minimal 16px di sekeliling layout.
- Grid layout yang bersih untuk memisahkan menu navigasi internal divisi.

Mood: kolaboratif, rapi, produktif.
```

### 6. Fitur: Perizinan, Feedback & Rapat (3 Halaman)
```text
Desainkan 3 page (Halaman Pengajuan Izin, Halaman Kritik & Saran, dan Tampilan Approval Center Pengurus) bertema minimalist corporate.

Struktur:
1. Halaman Pengajuan Izin (/izin):
   - Dropdown untuk memilih kegiatan yang ditinggalkan.
   - Textarea alasan tidak hadir dan file uploader bukti pendukung.
   - Tombol solid Navy Blue "Kirim Permohonan".
2. Halaman Kritik & Saran (/feedback):
   - Form kirim kritik & saran anonim/dengan nama kepada BPH.
3. Halaman Approval Center (/admin/approval):
   - Tab status permohonan: "Menunggu", "Disetujui", "Ditolak".
   - Daftar permohonan izin, event, proker, dan pengumuman yang membutuhkan persetujuan BPH/Kadiv.
   - Tombol aksi cepat: "Setujui" (ikon Check) atau "Tolak" (ikon X) dengan kolom catatan respon di bawahnya.

Tata Letak & Spacing:
- Margin minimal 16px pada setiap sisi halaman.
- Tombol aksi berukuran min 48px.

Mood: adil, transparan, cepat.
```

### 7. Fitur: Admin Dashboard & Manajemen Organisasi (4 Halaman)
```text
Desainkan 4 page (Halaman Laporan Analytics, Manajemen Anggota/Users, Manajemen Periode, dan Halaman Redirect Laporan) bertema minimalist corporate.

Struktur:
1. Halaman Laporan Analytics (/admin/analytics):
   - Grid metrik utama: Total Anggota, Persentase Kehadiran, Proker Selesai.
   - Chart garis/grafik minimalis monokromatik tren kehadiran rapat bulanan.
2. Halaman Manajemen Anggota (/admin/users):
   - Daftar anggota dalam bentuk tabel atau list mobile-friendly (baris ringkas).
   - Aksi toggle cepat untuk mematikan/mengaktifkan akun (isActive) dan menyetujui akun baru.
   - Box "Import Anggota (Excel)": zona drop file ber-border putus-putus (dashed border) warna abu-abu.
3. Halaman Manajemen Periode (/admin/periode):
   - Daftar periode kepengurusan dan form set periode aktif baru.
4. Halaman Redirect Laporan (/approval, /analytics, /periode):
   - Halaman transisi/redirect dengan loading state minimalis (spinner) yang meneruskan navigasi non-admin ke halaman berizin.

Tata Letak & Spacing:
- Spacing 24px di antara grid metrik dan tabel anggota.
- Margin 16px di seluruh sisi luar halaman.

Mood: informatif, andal, berwibawa.
```
