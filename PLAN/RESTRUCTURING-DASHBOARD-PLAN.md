# RESTRUCTURING DASHBOARD PLAN (HIMASTA PWA)

Dokumen ini mendokumentasikan hasil brainstorming penataan ulang (restrukturisasi) UI/UX PWA HIMASTA ke dalam **5 Tab Bottom Bar** dengan pendekatan *Minimalist Corporate*, serta spesifikasi detail interaksi *popup/modal* untuk mereduksi jumlah rute halaman dari 34 rute aktual Next.js.

---

## Fondasi Desain & Gaya Visual

* **Palet Warna Terbatas (High Contrast, Low Saturation)**:
  * **Ambil referensi html dari folder /PLAN/HIMASTA DESIGN ***: Gunakan design design itu untuk plan ini gunakan page page itu untuk plan ini.
  * **Primary (Brand)**: Navy Blue Korporat (`#1E3A8A`) untuk tombol utama, teks link, status aktif, dan aksen penting.
  * **Neutrals (Latar & Border)**: Off-white/slate halus (`#F8FAFC`) untuk background halaman PWA, putih bersih (`#FFFFFF`) untuk card/container, dan abu-abu tipis (`#E2E8F0` / `#64748B`) untuk border dan teks sekunder.
  * **Semantic (Status)**: Hijau redup/sukses (`#E6F4EA` text `#137333`), Kuning redup/peringatan (`#FEF7E0` text `#B06000`), Merah redup/error (`#FCE8E6` text `#C5221F`).
* **Tipografi**: Sans-serif bersih (Inter / Outfit / SF Pro), ukuran font terstruktur dengan kontras ketat (tidak terlalu banyak variasi ukuran font di satu halaman).
* **Tata Letak & Spacing**:
  * **PWA Mobile-First**: Semua elemen diatur untuk akses layar HP, tombol mudah diklik satu tangan (min target 48px).
  * **Margin Konsisten**: Margin minimal `16px` di setiap sisi terluar container halaman agar halaman memiliki ruang bernapas.
  * **Batas & Elevation**: Menggunakan border tipis `1px solid #E2E8F0` dengan radius sedang-kecil `rounded-md` atau `rounded-xl`. Tanpa bayangan (shadow) tebal atau gradasi mencolok.
  * **Ikon Konsisten**: Menggunakan Lucide React 2px stroke linear di seluruh komponen. Jangan gunakan emoji dekoratif.

---

## Pembagian 5 Tab Bottom Bar & Grouping Rute

## TAHAP 1
### Tab 1: Home (Portal Utama)
- **Rute yang Dicakup**: `/` (Portal), `/welcome`, `/welcome/tentang`.
- **Tampilan Utama**:
  - Welcome Banner ("Selamat datang, [Nama]" & info role).
  - Shortcut Scan Kegiatan di pojok kanan atas header.
  - Grid Akses Cepat (6 tombol): Proker, Izin, Dokumen, Kegiatan, Event, Feedback.
  - Feed Pengumuman Terbaru (maksimal 3-5 list pengumuman tipis).
- **Interaksi Popup/Modal**:
  - **Global Search**: Dibuka via klik ikon Kaca Pembesar di header kanan. Menampilkan pencarian instan (overlay) untuk mencari dokumen, kegiatan, proker, dan pengumuman dengan input auto-focus.
  - **Notifikasi**: Dibuka via klik ikon Lonceng di header kanan. Memunculkan overlay slide-down yang memuat daftar notifikasi belum dibaca (unread).

### Tab 2: Kalender (Agenda & Penjadwalan)
- **Rute yang Dicakup**: `/kalender`, `/kegiatan`, `/events`, `/events/[id]` (Publik).
- **Tampilan Utama**:
  - Kalender bulanan visual & daftar agenda mendatang (kegiatan/event).
  - Filter Tipe Jadwal: General, Divisi, Event, Akademik.
- **Interaksi Popup/Modal**:
  - **Detail Agenda**: Klik pada item tanggal atau baris agenda ➜ Menampilkan detail lengkap (deskripsi, jam, lokasi, dan opsi presensi jika sedang berlangsung) melalui *slide-up bottom sheet* (layar meluncur dari bawah).

## TAHAP 2
### Tab 3: Divisi (Workspace Hub / Mini Dashboard)
*Fokus: Menggabungkan tugas individu dan jadwal internal divisi agar pengguna tidak perlu berpindah tab.*
- **Tampilan Utama (Mini Dashboard Divisi)**:
  - **List Tugas Saya**: Menampilkan tugas aktif individu yang di-assign ke pengguna di divisi tersebut.
  - **Jadwal Meeting Divisi**: Rapat internal divisi terdekat dan riwayat absen rapat divisi.
  - **Arsip Berkas Divisi**: Akses cepat berkas/dokumen notulen, proposal, dan LPJ divisi.
  - **Forum Diskusi**: Thread obrolan internal koordinasi divisi.
- **Interaksi Popup/Modal**:
  - **Tambah Tugas**: Form input tugas baru (deskripsi, deadline, assignee) dibuka via modal.
  - **Detail Thread Diskusi**: Membuka percakapan forum diskusi sebagai panel geser (slide-over) kanan atau dialog modal besar.
  - **Mulai Rapat (BPH/Kadiv)**: Tombol pembuat sesi absen rapat instan dibuka via popup dialog untuk mengonfirmasi judul rapat dan waktu berakhir.

### Tab 4: Profil & QR
- **Rute yang Dicakup**: `/profil`.
- **Tampilan Utama**:
  - Identitas user (Avatar inisial, Nama, NIM, Divisi, Role).
  - QR Code Personal yang tersembunyi, dapat ditampilkan dengan menekan tombol "Tampilkan QR" (untuk di-scan BPH/Kadiv).
  - Riwayat keikutsertaan event & tombol unduh sertifikat.
- **Interaksi Popup/Modal**:
  - **QR Code Personal**: Popup modal yang menampilkan gambar QR Code resolusi tinggi di tengah layar dengan background redup.
  - **Scanner Absensi (Camera)**: Tombol melayang (floating action button) "Pindai QR" ➜ Buka kamera absensi mandiri sebagai overlay layar penuh (*fullscreen camera modal*).
  - **Detail & Unduh Sertifikat**: Klik sertifikat ➜ Membuka modal preview sertifikat dengan nomor registrasi resmi dan tombol unduh PDF.

## TAHAP 3
### Tab 5: Lainnya (Fitur Non-Essential & Role-Based)
- **Tampilan Utama (Bottom Sheet Drawer)**:
  - Layar geser meluncur dari bawah (bottom sheet) yang memuat kumpulan link menu administrative & non-essential.
- **Interaksi Popup/Modal (Role-Based Menu)**:
  - **Semua User**:
    - *Form Ajukan Izin*: Popup form untuk memilih kegiatan, input alasan tidak hadir, dan drop bukti pendukung.
    - *Kirim Feedback*: Form kritik & saran kepada BPH.
  - **BPH (Admin Area)**:
    - *Kelola Anggota*: Membuka tabel manajemen anggota, aksi aktif/nonaktifkan akun, dan box import Excel (dengan drop-zone dashed border).
    - *Laporan Analytics*: Menampilkan metrik visual (chart monokrom) kehadiran dan progress proker.
    - *Kelola Periode*: Form penutupan periode lama & pembuatan periode kepengurusan baru.
    - *Approval Center*: Persetujuan izin anggota, approval proker, & broadcast pengumuman.
  - **KADIV (Divisi Admin)**:
    - *Approval Center Divisi*: Panel persetujuan terbatas untuk menyetujui izin tidak hadir rapat & proposal proker khusus anggota divisinya sendiri.
### Verifikasi Hasil
---

## Ringkasan Detail Interaksi Popup & Modal

| Nama Popup / Modal | Pemicu (Trigger) | Bentuk Visual | Fitur Utama / Konten |
| :--- | :--- | :--- | :--- |
| **Global Search Overlay** | Icon Kaca Pembesar (Header Home) | Full-screen Blur Overlay | Input pencarian instan dengan kategori dinamis |
| **Notification Center** | Icon Lonceng (Header Home) | Drop-down / Slide-down Panel | List notifikasi unread & tombol "Tandai Semua Dibaca" |
| **Detail Agenda Sheet** | Klik item kalender / kegiatan | Bottom Sheet (Slide-up) | Deskripsi kegiatan, waktu, lokasi, dan status presensi |
| **QR Personal Modal** | Tombol "Tampilkan QR" (Profil) | Tonal Dialog (Centered) | QR Code token personal untuk dicatat hadir oleh pengawas |
| **Absensi Camera Overlay** | Tombol "Pindai QR" (Profil/Home) | Full-screen Camera View | Kamera aktif dengan scanner frame Navy di tengah |
| **Preview Sertifikat** | Klik riwayat event (Profil) | Card-style Modal (Centered) | Preview nomor resmi sertifikat & tombol unduh file |
| **Form Pengajuan Izin** | Tombol "Ajukan Izin" (Tab Lainnya) | Form Dialog (Centered) | Dropdown sesi, textarea alasan, upload bukti |
| **Form Kritik & Saran** | Tombol "Kirim Feedback" (Tab Lainnya) | Form Dialog (Centered) | Textarea feedback & switch pilihan "Anonim" |
| **Form Mulai Rapat** | Tombol "Mulai Rapat" (Tab Divisi) | Form Dialog (Centered) | Judul rapat, set batas waktu (endTime), buat QR sesi |
| **Import Excel Panel** | Tombol "Import Anggota" (Admin) | Dashed Drop-Zone Modal | Upload file xlsx/csv anggota baru & panduan format kolom |
| **Catatan Penolakan** | Tombol "Tolak" (Approval Center) | Collapsible Text Field | Kolom alasan penolakan yang wajib diisi sebelum submit |
