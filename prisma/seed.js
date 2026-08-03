// Seed script HIMASTA V1
// Menjalankan: npx prisma db seed
// Idempotent — aman dijalankan berulang (upsert, tanpa duplikat).
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const DIVISIONS = [
  { name: 'BPH', slug: 'bph', description: 'Badan Pengurus Harian — koordinasi seluruh divisi' },
  { name: 'PSDM', slug: 'psdm', description: 'Pengembangan Sumber Daya Manusia' },
  { name: 'RION', slug: 'rion', description: 'Riset & Inovasi' },
  { name: 'PR', slug: 'pr', description: 'Public Relations' },
  { name: 'KOMINFO', slug: 'kominfo', description: 'Komunikasi & Informasi' },
]

async function main() {
  console.log('🌱 Seeding HIMASTA V1...')

  const createdDivisions = {}
  for (const d of DIVISIONS) {
    createdDivisions[d.slug] = await prisma.division.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description },
      create: d,
    })
  }
  console.log(`✓ ${Object.keys(createdDivisions).length} divisi siap`)

  const password = await bcrypt.hash('himasta123', 10)

  const users = [
    { nim: '22001', email: 'bph@himasta.id', name: 'Raka BPH', role: 'BPH', divisionSlug: 'bph' },
    { nim: '22002', email: 'kadiv.psdm@himasta.id', name: 'Dinda PSDM', role: 'KADIV', divisionSlug: 'psdm' },
    { nim: '22003', email: 'kadiv.rion@himasta.id', name: 'Bima RION', role: 'KADIV', divisionSlug: 'rion' },
    { nim: '22004', email: 'kadiv.pr@himasta.id', name: 'Salsa PR', role: 'KADIV', divisionSlug: 'pr' },
    { nim: '22005', email: 'kadiv.kominfo@himasta.id', name: 'Fajar KOMINFO', role: 'KADIV', divisionSlug: 'kominfo' },
    { nim: '22006', email: 'anggota.psdm@himasta.id', name: 'Nadia Anggota', role: 'ANGGOTA', divisionSlug: 'psdm' },
    { nim: '22007', email: 'anggota.rion@himasta.id', name: 'Arif Anggota', role: 'ANGGOTA', divisionSlug: 'rion' },
    { nim: '22008', email: 'anggota.pr@himasta.id', name: 'Mira Anggota', role: 'ANGGOTA', divisionSlug: 'pr' },
    { nim: '22009', email: 'anggota.kominfo@himasta.id', name: 'Rizky Anggota', role: 'ANGGOTA', divisionSlug: 'kominfo' },
    { email: 'dosen@himasta.id', name: 'Dr. Surya Dosen', role: 'DOSEN', divisionSlug: null },
  ]

  const createdUsers = {}
  for (const u of users) {
    const divisionId = u.divisionSlug ? createdDivisions[u.divisionSlug].id : null
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { nim: u.nim, name: u.name, role: u.role, divisionId },
      create: {
        nim: u.nim,
        email: u.email,
        password,
        name: u.name,
        role: u.role,
        divisionId,
        phone: '0812-3456-7890',
      },
    })
    createdUsers[u.email] = created
  }
  console.log(`✓ ${Object.keys(createdUsers).length} user demo siap (password: himasta123)`)

  // Pengumuman contoh (upsert by unique title — cukup untuk idempotency demo)
  const bph = createdUsers['bph@himasta.id']
  const announcements = [
    {
      title: 'Selamat Datang di Sistem HIMASTA',
      content:
        'Sistem informasi resmi HIMASTA sudah aktif. Pengumuman resmi organisasi sekarang terpusat di aplikasi ini.',
      category: 'organisasi',
      scope: 'GENERAL',
      status: 'PUBLISHED',
      authorEmail: 'bph@himasta.id',
      approved: true,
      visibleToDosen: true,
    },
    {
      title: 'Jadwal Rapat Mingguan PSDM',
      content:
        'Rapat mingguan PSDM diadakan setiap Jumat pukul 16.00 WIB di ruang 2.4. Absensi via QR akan dibuka 15 menit sebelum rapat.',
      category: 'organisasi',
      scope: 'DIVISION',
      divisionSlug: 'psdm',
      status: 'PUBLISHED',
      authorEmail: 'kadiv.psdm@himasta.id',
      approved: true,
    },
    {
      title: 'Open Recruitment Tim Riset RION',
      content:
        'RION membuka pendaftaran untuk riset data. Pendaftaran dibuka hingga akhir bulan ini.',
      category: 'event',
      scope: 'GENERAL',
      status: 'PENDING_APPROVAL',
      authorEmail: 'kadiv.rion@himasta.id',
      approved: false,
    },
    {
      title: 'Info Beasiswa Data Science 2026',
      content:
        'Beasiswa tersedia untuk mahasiswa aktif Sains Data dengan IPK minimal 3.2. Kumpulkan berkas sebelum tenggat.',
      category: 'beasiswa',
      scope: 'GENERAL',
      status: 'PUBLISHED',
      authorEmail: 'bph@himasta.id',
      approved: true,
      visibleToDosen: true,
    },
  ]

  const announcementMap = {}
  for (const a of announcements) {
    const divisionId = a.divisionSlug ? createdDivisions[a.divisionSlug].id : null
    const author = createdUsers[a.authorEmail]
    const existing = await prisma.announcement.findFirst({ where: { title: a.title } })
    if (existing) {
      announcementMap[a.title] = existing
      continue
    }
    const created = await prisma.announcement.create({
      data: {
        title: a.title,
        content: a.content,
        category: a.category,
        scope: a.scope,
        divisionId,
        status: a.status,
        authorId: author.id,
        approvedById: a.approved ? bph.id : null,
        visibleToDosen: a.visibleToDosen ?? false,
        publishedAt: a.approved ? new Date() : null,
      },
    })
    announcementMap[a.title] = created
  }
  console.log(`✓ ${Object.keys(announcementMap).length} pengumuman contoh siap`)

  // Sesi absensi contoh
  const session = await prisma.attendanceSession.upsert({
    where: { qrToken: 'demo-session-psdm-1' },
    update: {},
    create: {
      title: 'Rapat Perdana PSDM',
      description: 'Rapat perdana anggota divisi PSDM periode berjalan.',
      divisionId: createdDivisions['psdm'].id,
      qrToken: 'demo-session-psdm-1',
      createdById: bph.id,
      startTime: new Date(),
      isActive: true,
    },
  })

  // Rekap kehadiran demo untuk sesi tersebut
  const psdmMembers = [
    createdUsers['kadiv.psdm@himasta.id'],
    createdUsers['anggota.psdm@himasta.id'],
  ]
  for (const member of psdmMembers) {
    await prisma.attendanceRecord.upsert({
      where: { sessionId_userId: { sessionId: session.id, userId: member.id } },
      update: {},
      create: {
        sessionId: session.id,
        userId: member.id,
        scannedAt: new Date(),
      },
    })
  }
  console.log('✓ 1 sesi absensi + rekap contoh siap')

  // Dokumen contoh (hanya dibuat bila belum ada — fileUrl disimpan sebagai placeholder)
  const sampleDocs = [
    {
      title: 'Notulen Rapat PSDM #1',
      description: 'Pembahasan agenda divisi dan pembagian task minggu ini.',
      category: 'NOTULEN',
      divisionSlug: 'psdm',
      uploaderEmail: 'kadiv.psdm@himasta.id',
    },
    {
      title: 'Proposal Open Recruitment RION',
      description: 'Dokumen usulan kegiatan penerimaan anggota baru tim riset.',
      category: 'PROPOSAL',
      divisionSlug: 'rion',
      uploaderEmail: 'kadiv.rion@himasta.id',
    },
    {
      title: 'LPJ Periode Berjalan (Contoh)',
      description: 'Laporan pertanggungjawaban kegiatan BPH — contoh format.',
      category: 'LPJ',
      divisionSlug: 'bph',
      uploaderEmail: 'bph@himasta.id',
    },
  ]
  for (const d of sampleDocs) {
    const divisionId = createdDivisions[d.divisionSlug].id
    const existing = await prisma.document.findFirst({ where: { title: d.title } })
    if (existing) continue
    await prisma.document.create({
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        fileUrl: 'https://example.com/placeholder-dokumen.pdf',
        fileName: 'placeholder.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        divisionId,
        uploadedById: createdUsers[d.uploaderEmail].id,
      },
    })
  }
  console.log('✓ 3 dokumen contoh siap')

  console.log('✅ Seed selesai! (idempotent — aman dijalankan ulang)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
