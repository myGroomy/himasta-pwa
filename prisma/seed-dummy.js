const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function drand(str) {
  return hashStr(str) / 4294967296
}

const rng = mulberry32(20262027)
const PERIOD_NAME = '2025/2026'

const DIVISIONS = [
  { name: 'BPH', slug: 'bph', description: 'Badan Pengurus Harian koordinasi seluruh divisi' },
  { name: 'PSDM', slug: 'psdm', description: 'Pengembangan Sumber Daya Manusia' },
  { name: 'RION', slug: 'rion', description: 'Riset & Inovasi' },
  { name: 'PR', slug: 'pr', description: 'Public Relations' },
  { name: 'KOMINFO', slug: 'kominfo', description: 'Komunikasi & Informasi' },
  { name: 'Akademik', slug: 'akademik', description: 'Divisi Akademik dan Keilmuan' },
]

const MEMBERS = [
  { name: 'Ahmad Faizal', role: 'BPH', div: 'bph' },
  { name: 'Siti Rahmawati', role: 'BPH', div: 'bph' },
  { name: 'Dimas Prasetyo', role: 'BPH', div: 'bph' },
  { name: 'Putri Ayu Lestari', role: 'BPH', div: 'bph' },
  { name: 'Rizki Ramadhan', role: 'KADIV', div: 'psdm' },
  { name: 'Nadia Putri', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Fajar Nugroho', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Intan Permata', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Yusuf Maulana', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Bella Anggraini', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Hendra Wijaya', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Salsa Maharani', role: 'ANGGOTA', div: 'psdm' },
  { name: 'Ilham Hakim', role: 'ANGGOTA', div: 'psdm' },
  { name: 'M Rizky Pratama', role: 'KADIV', div: 'rion' },
  { name: 'Dewi Lestari', role: 'ANGGOTA', div: 'rion' },
  { name: 'Andi Saputra', role: 'ANGGOTA', div: 'rion' },
  { name: 'Ratna Sari', role: 'ANGGOTA', div: 'rion' },
  { name: 'Fikri Ramadhan', role: 'ANGGOTA', div: 'rion' },
  { name: 'Ayu Wandira', role: 'ANGGOTA', div: 'rion' },
  { name: 'Bagas Kurniawan', role: 'ANGGOTA', div: 'rion' },
  { name: 'Citra Kirana', role: 'ANGGOTA', div: 'rion' },
  { name: 'Dedi Setiawan', role: 'ANGGOTA', div: 'rion' },
  { name: 'Rina Marlina', role: 'KADIV', div: 'pr' },
  { name: 'Galih Pratama', role: 'ANGGOTA', div: 'pr' },
  { name: 'Laras Ayudia', role: 'ANGGOTA', div: 'pr' },
  { name: 'Taufik Hidayat', role: 'ANGGOTA', div: 'pr' },
  { name: 'Widya Astuti', role: 'ANGGOTA', div: 'pr' },
  { name: 'Eko Prasetyo', role: 'ANGGOTA', div: 'pr' },
  { name: 'Nabila Zahra', role: 'ANGGOTA', div: 'pr' },
  { name: 'Rendi Firmansyah', role: 'ANGGOTA', div: 'pr' },
  { name: 'Shinta Dewi', role: 'ANGGOTA', div: 'pr' },
  { name: 'Fauzan Adima', role: 'KADIV', div: 'kominfo' },
  { name: 'Arga Sanjaya', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Bunga Citra', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Chandra Winata', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Diana Putri', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Erwin Gunawan', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Fitri Handayani', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Gilang Ramadhan', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Hesti Pratiwi', role: 'ANGGOTA', div: 'kominfo' },
  { name: 'Indra Mahendra', role: 'KADIV', div: 'akademik' },
  { name: 'Joko Santoso', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Kartika Sari', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Lukman Nugroho', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Mita Puspita', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Naufal Alfian', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Oki Prasetia', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Putra Ananda', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Qori Amalia', role: 'ANGGOTA', div: 'akademik' },
  { name: 'Dr. Bambang Wicaksono', role: 'DOSEN', div: null },
]

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, '')
    .trim()
    .split(/\s+/)
    .join('.')
}

function periodDate(month, day, hour, minute = 0) {
  const year = month <= 7 ? 2026 : 2025
  return new Date(Date.UTC(year, month - 1, day, hour, minute))
}

const REASONS = [
  'Ada jadwal kuliah pengganti di jam yang sama.',
  'Sedang sakit, surat keterangan menyusul.',
  'Ada keperluan keluarga mendadak.',
  'Mengikuti rapat organisasi lain.',
  'Kegiatan magang di sore hari.',
]

const IZIN_APPROVE_NOTES = [
  'Oke, jaga kesehatan. Lapor perkembangannya ya.',
  'Disetujui, kirim konfirmasi kehadiran materi rapat.',
  'Baik, selanjutnya koordinasi via grup divisi.',
]

const EVENT_COMMENTS = [
  'Acaranya seru dan bermanfaat.',
  'Materinya jelas dan mudah dipahami.',
  'Waktu pelaksanaan pas.',
  'Semoga tahun depan lebih meriah lagi.',
  'Panitia ramah dan rapi.',
]

const TASK_TITLES = [
  ['Menyusun proposal', 'Publikasi pendaftaran', 'Koordinator acara'],
  ['Riset kebutuhan anggota', 'Draft materi', 'Evaluasi pelaksanaan'],
  ['Koordinasi dengan vendor', 'Penyusunan rundown', 'Dokumentasi'],
]

async function main() {
  console.log('Seeding dummy data: 50 user + 1 periode penuh (2025/2026)')

  const divisions = {}
  for (const d of DIVISIONS) {
    divisions[d.slug] = await prisma.division.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description },
      create: d,
    })
  }
  console.log(`- ${Object.keys(divisions).length} divisi siap`)

  const period = await prisma.period.upsert({
    where: { name: PERIOD_NAME },
    update: {},
    create: {
      name: PERIOD_NAME,
      isActive: true,
      startDate: new Date(Date.UTC(2025, 7, 1)),
      endDate: new Date(Date.UTC(2026, 6, 31)),
    },
  })
  await prisma.period.updateMany({ where: { isActive: true, id: { not: period.id } }, data: { isActive: false } })

  const password = await bcrypt.hash('himasta123', 10)

  const usersByNim = {}
  const usersByDiv = { bph: [], psdm: [], rion: [], pr: [], kominfo: [], akademik: [] }
  const usersByRole = { BPH: [], KADIV: [], ANGGOTA: [], DOSEN: [] }

  for (let i = 0; i < MEMBERS.length; i++) {
    const m = MEMBERS[i]
    const nim = '23' + String(i + 1).padStart(3, '0')
    const email = `${slugify(m.name)}@himasta.id`
    const divisionId = m.div ? divisions[m.div].id : null
    const created = await prisma.user.upsert({
      where: { email },
      update: { nim, name: m.name, role: m.role, divisionId },
      create: {
        nim,
        email,
        password,
        name: m.name,
        role: m.role,
        divisionId,
        phone: `0812-${nim.slice(2, 4)}-${nim.slice(4)}xx`,
        qrToken: `qrt-${nim}`,
        isActive: true,
        pendingApproval: false,
      },
    })
    usersByNim[nim] = created
    if (m.div) usersByDiv[m.div].push(created)
    usersByRole[m.role].push(created)
  }
  console.log(`- ${Object.keys(usersByNim).length} user siap (password: himasta123)`)

  const nonDosen = [...usersByRole.ANGGOTA, ...usersByRole.KADIV, ...usersByRole.BPH]
  const leaders = [...usersByRole.BPH, ...usersByRole.KADIV]
  const bph1 = usersByRole.BPH[0]
  const kadivByDiv = {}
  for (const slug of ['psdm', 'rion', 'pr', 'kominfo', 'akademik']) {
    kadivByDiv[slug] = usersByDiv[slug].find((u) => u.role === 'KADIV')
  }

  const memberHistories = []
  for (const u of nonDosen) {
    memberHistories.push({
      userId: u.id,
      periodId: period.id,
      divisionId: u.divisionId,
      role: u.role,
      status: 'AKTIF',
      joinedAt: periodDate(8, 5 + Math.floor(rng() * 20), 8),
    })
  }
  const mhResult = await prisma.memberHistory.createMany({ data: memberHistories, skipDuplicates: true })
  console.log(`- ${mhResult.count} memberHistory periode ${PERIOD_NAME}`)

  const DIV_LABEL = { psdm: 'PSDM', rion: 'RION', pr: 'PR', kominfo: 'KOMINFO', akademik: 'Akademik' }

  const sessionTemplates = []
  for (const slug of ['psdm', 'rion', 'pr', 'kominfo', 'akademik']) {
    const months = [9, 10, 11, 1, 3, 5]
    for (let i = 0; i < months.length; i++) {
      sessionTemplates.push({
        title: `Rapat Koordinasi ${DIV_LABEL[slug]} #${i + 1}`,
        description: `Rapat rutin koordinasi agenda divisi ${DIV_LABEL[slug]} periode berjalan.`,
        category: 'RAPAT',
        divisionSlug: slug,
        token: `sesi-rapat-${slug}-${i + 1}`,
        start: periodDate(months[i], 5 + i * 2, 16, 0),
        pool: 'div',
        createdBy: kadivByDiv[slug],
      })
    }
    sessionTemplates.push({
      title: `Monitoring Proker ${DIV_LABEL[slug]}`,
      description: `Evaluasi progres program kerja divisi ${DIV_LABEL[slug]}.`,
      category: 'PROKER',
      divisionSlug: slug,
      token: `sesi-proker-${slug}`,
      start: periodDate(6, 18, 15, 0),
      pool: 'div',
      createdBy: kadivByDiv[slug],
    })
    sessionTemplates.push({
      title: `Pelatihan Internal ${DIV_LABEL[slug]}`,
      description: `Peningkatan kapasitas anggota divisi ${DIV_LABEL[slug]}.`,
      category: 'LAINNYA',
      divisionSlug: slug,
      token: `sesi-pelatihan-${slug}`,
      start: periodDate(7, 10, 9, 0),
      pool: 'div',
      createdBy: kadivByDiv[slug],
    })
  }

  const bphInternalMonths = [9, 11, 2, 5]
  for (let i = 0; i < bphInternalMonths.length; i++) {
    sessionTemplates.push({
      title: `Rapat Internal BPH #${i + 1}`,
      description: 'Rapat internal Badan Pengurus Harian.',
      category: 'RAPAT',
      divisionSlug: 'bph',
      token: `sesi-bph-internal-${i + 1}`,
      start: periodDate(bphInternalMonths[i], 3 + i * 4, 15, 0),
      pool: 'bph',
      createdBy: bph1,
    })
  }

  sessionTemplates.push(
    {
      title: 'Musyawarah Besar HIMASTA 2025',
      description: 'Mubes penetapan program kerja dan kepengurusan periode berjalan.',
      category: 'MUBES',
      divisionSlug: null,
      token: 'sesi-mubes-2025',
      start: periodDate(9, 20, 9, 0),
      pool: 'all',
      createdBy: bph1,
    },
    {
      title: 'Makrab HIMASTA 2025',
      description: 'Malam keakraban seluruh pengurus dan anggota HIMASTA.',
      category: 'MAKRAB',
      divisionSlug: null,
      token: 'sesi-makrab-2025',
      start: periodDate(11, 22, 14, 0),
      pool: 'all',
      createdBy: bph1,
    },
    {
      title: 'Rapat Kerja HIMASTA 2026',
      description: 'Rapat kerja penyusunan rencana kerja semester genap.',
      category: 'RAPAT',
      divisionSlug: null,
      token: 'sesi-raker-2026',
      start: periodDate(1, 17, 8, 0),
      pool: 'leaders',
      createdBy: bph1,
    },
    {
      title: 'Evaluasi Tengah Periode',
      description: 'Evaluasi capaian program kerja paruh pertama periode.',
      category: 'RAPAT',
      divisionSlug: null,
      token: 'sesi-evaluasi-2026',
      start: periodDate(4, 25, 9, 0),
      pool: 'leaders',
      createdBy: bph1,
    }
  )
  const koordinasiMonths = [10, 12, 2, 5]
  for (let i = 0; i < koordinasiMonths.length; i++) {
    sessionTemplates.push({
      title: `Rapat Koordinasi Pengurus #${i + 1}`,
      description: 'Koordinasi lintas divisi BPH dan seluruh kepala divisi.',
      category: 'RAPAT',
      divisionSlug: null,
      token: `sesi-koordinasi-pengurus-${i + 1}`,
      start: periodDate(koordinasiMonths[i], 5 + i * 7, 15, 30),
      pool: 'leaders',
      createdBy: bph1,
    })
  }

  const attendanceRecords = []
  const permissionCandidates = []
  for (const t of sessionTemplates) {
    const isRecent = t.start.getUTCMonth() >= 5 && t.start.getUTCFullYear() === 2026
    const session = await prisma.attendanceSession.upsert({
      where: { qrToken: t.token },
      update: {},
      create: {
        title: t.title,
        description: t.description,
        category: t.category,
        divisionId: t.divisionSlug ? divisions[t.divisionSlug].id : null,
        qrToken: t.token,
        createdById: t.createdBy.id,
        startTime: t.start,
        endTime: new Date(t.start.getTime() + 90 * 60000),
        isActive: isRecent,
      },
    })

    let pool
    if (t.pool === 'div') pool = usersByDiv[t.divisionSlug]
    else if (t.pool === 'bph') pool = usersByRole.BPH
    else if (t.pool === 'leaders') pool = leaders
    else pool = nonDosen

    const approver = t.divisionSlug && kadivByDiv[t.divisionSlug] ? kadivByDiv[t.divisionSlug] : bph1

    for (const u of pool) {
      const r = drand(`${t.token}|${u.nim}`)
      let status = 'HADIR'
      if (r < 0.88) status = 'HADIR'
      else if (r < 0.94) status = 'IZIN'
      else status = 'TANPA_KETERANGAN'

      attendanceRecords.push({
        sessionId: session.id,
        userId: u.id,
        status,
        scannedAt: t.start,
      })

      if (status === 'IZIN' && drand(`${t.token}|${u.nim}|izin`) < 0.8) {
        permissionCandidates.push({
          reason: REASONS[Math.floor(drand(`${t.token}|${u.nim}|r`) * REASONS.length)],
          sessionTitle: session.title,
          sessionId: session.id,
          status: 'DISETUJUI',
          requesterId: u.id,
          approvedById: approver.id,
          responseNote: IZIN_APPROVE_NOTES[Math.floor(drand(`${t.token}|${u.nim}|n`) * IZIN_APPROVE_NOTES.length)],
          decidedAt: new Date(t.start.getTime() + 86400000),
          createdAt: t.start,
        })
      }
    }
  }
  const recResult = await prisma.attendanceRecord.createMany({ data: attendanceRecords, skipDuplicates: true })
  console.log(`- ${sessionTemplates.length} sesi absensi + ${recResult.count} rekap kehadiran`)

  let permissionCount = 0
  for (const p of permissionCandidates) {
    const exists = await prisma.permission.findFirst({
      where: { sessionTitle: p.sessionTitle, requesterId: p.requesterId },
    })
    if (!exists) {
      await prisma.permission.create({ data: p })
      permissionCount++
    }
  }
  console.log(`- ${permissionCount} izin disetujui`)

  const events = [
    {
      name: 'Open Recruitment Anggota Baru 2025',
      description: 'Penerimaan anggota baru HIMASTA periode 2025/2026.',
      start: periodDate(9, 15, 9, 0),
      end: periodDate(9, 15, 15, 0),
      location: 'Gedung B, Kampus ULBI',
      capacity: null,
      visibility: 'INTERNAL',
      status: 'PUBLISHED',
      div: 'psdm',
      createdBy: kadivByDiv['psdm'],
    },
    {
      name: 'Workshop Dasar Analisis Data',
      description: 'Pengenalan analisis data dengan Excel dan Python untuk umum.',
      start: periodDate(10, 12, 9, 0),
      end: periodDate(10, 12, 15, 0),
      location: 'Lab Komputer Gedung C',
      capacity: 50,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      div: 'rion',
      createdBy: kadivByDiv['rion'],
    },
    {
      name: 'Makrab HIMASTA 2025',
      description: 'Malam keakraban anggota HIMASTA seluruh divisi.',
      start: periodDate(11, 22, 14, 0),
      end: periodDate(11, 23, 12, 0),
      location: 'Villa Cisarua, Puncak',
      capacity: 120,
      visibility: 'INTERNAL',
      status: 'PUBLISHED',
      div: 'bph',
      createdBy: bph1,
    },
    {
      name: 'Seminar Nasional Sains Data',
      description: 'Seminar nasional dengan pembicara praktisi dan akademisi data.',
      start: periodDate(3, 20, 8, 0),
      end: periodDate(3, 20, 16, 0),
      location: 'Auditorium ULBI',
      capacity: 200,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      div: 'akademik',
      createdBy: kadivByDiv['akademik'],
    },
    {
      name: 'Bakti Sosial & Donor Darah',
      description: 'Kegiatan sosial dan donor darah bekerjasama dengan PMI.',
      start: periodDate(6, 14, 8, 0),
      end: periodDate(6, 14, 13, 0),
      location: 'Aula Kampus ULBI',
      capacity: null,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      div: 'pr',
      createdBy: kadivByDiv['pr'],
    },
    {
      name: 'Lomba Analisis Data Antar Kampus',
      description: 'Kompetisi analisis data tingkat nasional antar mahasiswa.',
      start: periodDate(7, 25, 8, 0),
      end: periodDate(7, 26, 17, 0),
      location: 'Kampus ULBI',
      capacity: 80,
      visibility: 'PUBLIC',
      status: 'PENDING_APPROVAL',
      div: 'akademik',
      createdBy: kadivByDiv['akademik'],
    },
    {
      name: 'PKKMB & Campus Tour Sains Data',
      description: 'Penyambutan mahasiswa baru dan tur kampus.',
      start: periodDate(8, 20, 8, 0),
      end: periodDate(8, 20, 15, 0),
      location: 'Gedung A, Kampus ULBI',
      capacity: 150,
      visibility: 'INTERNAL',
      status: 'PUBLISHED',
      div: 'psdm',
      createdBy: kadivByDiv['psdm'],
    },
    {
      name: 'Workshop Python untuk Data Science',
      description: 'Workshop pemrograman Python terapan untuk data science.',
      start: periodDate(9, 15, 9, 0),
      end: periodDate(9, 15, 16, 0),
      location: 'Lab Komputer Gedung C',
      capacity: 40,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      div: 'rion',
      createdBy: kadivByDiv['rion'],
    },
  ]

  const now = new Date()
  let registrationCount = 0
  let externalCount = 0
  let surveyCount = 0

  for (const e of events) {
    let event = await prisma.event.findFirst({ where: { name: e.name } })
    if (!event) {
      event = await prisma.event.create({
        data: {
          name: e.name,
          description: e.description,
          startTime: e.start,
          endTime: e.end,
          location: e.location,
          capacity: e.capacity,
          visibility: e.visibility,
          status: e.status,
          divisionId: e.div ? divisions[e.div].id : null,
          createdById: e.createdBy.id,
          approvedById: e.status === 'PUBLISHED' ? bph1.id : null,
          approvedAt: e.status === 'PUBLISHED' ? new Date(e.start.getTime() - 7 * 86400000) : null,
          publishedAt: e.status === 'PUBLISHED' ? new Date(e.start.getTime() - 7 * 86400000) : null,
        },
      })
    }

    if (e.status !== 'PUBLISHED') continue

    const isPast = e.start < now
    let eventMembers
    if (e.visibility === 'PUBLIC') eventMembers = nonDosen
    else if (e.div && e.div !== 'bph') eventMembers = usersByDiv[e.div]
    else eventMembers = nonDosen

    const registrations = []
    const surveys = []
    for (const u of eventMembers) {
      const sameDiv = e.div ? u.divisionId === divisions[e.div].id : false
      const chance = sameDiv ? 1 : 0.45
      const roll = drand(`${event.id}|${u.nim}`)
      if (roll >= chance) continue

      registrations.push({
        eventId: event.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        qrToken: `evt_${event.id.slice(-6)}_${u.nim}`,
        attended: isPast,
      })
      registrationCount++

      if (isPast && drand(`${event.id}|${u.nim}|survey`) < 0.6) {
        surveys.push({
          eventId: event.id,
          userId: u.id,
          rating: 3 + Math.floor(drand(`${event.id}|${u.nim}|rating`) * 3),
          comment: EVENT_COMMENTS[Math.floor(drand(`${event.id}|${u.nim}|comment`) * EVENT_COMMENTS.length)],
          isAnon: drand(`${event.id}|${u.nim}|anon`) < 0.2,
        })
        surveyCount++
      }
    }
    const regResult = await prisma.eventRegistration.createMany({ data: registrations, skipDuplicates: true })
    const surveyResult = await prisma.eventSurvey.createMany({ data: surveys, skipDuplicates: true })

    if (e.visibility === 'PUBLIC') {
      const externals = [
        { name: 'Andi Peserta Eksternal', email: 'andi.eksternal@mail.com', phone: '0857-1111-2222' },
        { name: 'Budi Peserta Umum', email: 'budi.umum@mail.com', phone: '0857-3333-4444' },
      ]
      for (const ext of externals) {
        const exists = await prisma.eventRegistration.findFirst({
          where: { eventId: event.id, email: ext.email },
        })
        if (!exists) {
          await prisma.eventRegistration.create({
            data: {
              eventId: event.id,
              name: ext.name,
              email: ext.email,
              phone: ext.phone,
              institution: 'Mahasiswa Umum',
              qrToken: `evt_${event.id.slice(-6)}_${hashStr(ext.email).toString(36)}`,
              attended: isPast,
            },
          })
          externalCount++
        }
      }
    }
  }
  console.log(`- ${events.length} event, ${registrationCount} pendaftaran, ${externalCount} eksternal, ${surveyCount} survey`)

  const prokers = [
    { div: 'psdm', name: 'Open Recruitment Anggota Baru 2025', status: 'SELESAI', budget: 500000, start: periodDate(9, 1, 0), end: periodDate(11, 30, 0) },
    { div: 'psdm', name: 'Pelatihan Public Speaking', status: 'BERJALAN', budget: 750000, start: periodDate(5, 1, 0), end: periodDate(8, 31, 0) },
    { div: 'psdm', name: 'Bonding Anggota Baru', status: 'RENCANA', budget: 900000, start: periodDate(9, 1, 0), end: periodDate(10, 31, 0) },
    { div: 'rion', name: 'Seminar Data Science 2025', status: 'SELESAI', budget: 2500000, start: periodDate(10, 1, 0), end: periodDate(12, 31, 0) },
    { div: 'rion', name: 'Tim Riset Data', status: 'BERJALAN', budget: 300000, start: periodDate(1, 1, 0), end: periodDate(12, 31, 0) },
    { div: 'rion', name: 'Hackathon Data 2026', status: 'RENCANA', budget: 1500000, start: periodDate(10, 1, 0), end: periodDate(12, 15, 0) },
    { div: 'pr', name: 'Bakti Sosial 2025', status: 'SELESAI', budget: 1200000, start: periodDate(11, 1, 0), end: periodDate(6, 30, 0) },
    { div: 'pr', name: 'Kerjasama Eksternal & MOU', status: 'BERJALAN', budget: 200000, start: periodDate(2, 1, 0), end: periodDate(12, 31, 0) },
    { div: 'pr', name: 'Company Visit Industri Data', status: 'RENCANA', budget: 2000000, start: periodDate(9, 1, 0), end: periodDate(11, 30, 0) },
    { div: 'kominfo', name: 'Website & Sistem Informasi HIMASTA', status: 'SELESAI', budget: 350000, start: periodDate(8, 1, 0), end: periodDate(12, 20, 0) },
    { div: 'kominfo', name: 'Publikasi Media Sosial', status: 'BERJALAN', budget: 150000, start: periodDate(1, 1, 0), end: periodDate(12, 31, 0) },
    { div: 'kominfo', name: 'Podcast HIMASTA', status: 'RENCANA', budget: 800000, start: periodDate(9, 1, 0), end: periodDate(12, 31, 0) },
    { div: 'akademik', name: 'Seminar Nasional Sains Data', status: 'SELESAI', budget: 3000000, start: periodDate(12, 1, 0), end: periodDate(3, 31, 0) },
    { div: 'akademik', name: 'Bimbingan Belajar Data', status: 'BERJALAN', budget: 250000, start: periodDate(3, 1, 0), end: periodDate(8, 31, 0) },
    { div: 'akademik', name: 'Olimpiade Sains Data', status: 'RENCANA', budget: 1800000, start: periodDate(9, 1, 0), end: periodDate(11, 30, 0) },
  ]

  const TIMELINE = { SELESAI: 'Agustus–Desember 2025', BERJALAN: '2026 (semester genap)', RENCANA: '2026 (semester ganjil)' }
  let prokerCount = 0
  let taskCount = 0

  for (const p of prokers) {
    const existing = await prisma.proker.findFirst({ where: { name: p.name } })
    if (existing) continue
    const div = usersByDiv[p.div]
    const kadiv = kadivByDiv[p.div]
    const anggotas = div.filter((u) => u.role === 'ANGGOTA')
    const created = await prisma.proker.create({
      data: {
        name: p.name,
        description: `Program kerja ${DIV_LABEL[p.div]} periode berjalan.`,
        status: p.status,
        timeline: TIMELINE[p.status],
        startDate: p.start,
        endDate: p.end,
        estimateBudget: p.budget,
        actualBudget: p.status === 'SELESAI' ? Math.round(p.budget * (0.85 + rng() * 0.3)) : null,
        divisionId: divisions[p.div].id,
        proposedById: kadiv.id,
        approvedById: p.status === 'RENCANA' ? null : bph1.id,
        approvedAt: p.status === 'RENCANA' ? null : new Date(p.start.getTime() + 3 * 86400000),
        pjId: anggotas[Math.floor(rng() * anggotas.length)].id,
      },
    })
    prokerCount++

    const tasks = []
    const templates = TASK_TITLES[Math.floor(rng() * TASK_TITLES.length)]
    for (let i = 0; i < 3; i++) {
      tasks.push({
        title: templates[i],
        status: ['SELESAI', 'SELESAI', 'BERJALAN', 'BELUM'][Math.floor(rng() * 4)],
        prokerId: created.id,
        assigneeId: anggotas[Math.floor(rng() * anggotas.length)].id,
      })
    }
    const taskResult = await prisma.task.createMany({ data: tasks })
    taskCount += taskResult.count

    if (p.status === 'SELESAI') {
      const evExists = await prisma.prokerEvaluation.findUnique({ where: { prokerId: created.id } })
      if (!evExists) {
        await prisma.prokerEvaluation.create({
          data: {
            prokerId: created.id,
            periodId: period.id,
            authorId: kadiv.id,
            whatWorked: 'Koordinasi internal divisi berjalan lancar dan timeline realistis.',
            whatFailed: 'Publikasi masih kurang masif, partisipasi peserta di bawah target awal.',
            lessons: 'Perlu perencanaan publikasi lebih awal dan cadangan dana operasional.',
            overallRating: 4,
          },
        })
      }
    }
  }
  console.log(`- ${prokerCount} proker baru + ${taskCount} task`)

  const announcements = [
    { title: 'Selamat Datang Periode 2025/2026', content: 'Kepengurusan baru HIMASTA resmi dilantik. Seluruh anggota diharapkan aktif mengikuti program kerja periode ini.', category: 'organisasi', scope: 'GENERAL', author: bph1, visibleToDosen: true },
    { title: 'Jadwal Rapat Kerja 2026', content: 'Rapat kerja semester genap akan dilaksanakan 17 Januari 2026 di Aula ULBI, wajib hadir seluruh pengurus.', category: 'organisasi', scope: 'GENERAL', author: bph1, visibleToDosen: false },
    { title: 'Pendaftaran Makrab HIMASTA 2025', content: 'Pendaftaran makrab dibuka hingga 10 November 2025. Kuota terbatas, daftar sebelum penuh.', category: 'event', scope: 'GENERAL', author: bph1, visibleToDosen: false },
    { title: 'Info Beasiswa Data Science 2026', content: 'Beasiswa tersedia untuk mahasiswa aktif Sains Data dengan IPK minimal 3.2. Kumpulkan berkas sebelum tenggat.', category: 'beasiswa', scope: 'GENERAL', author: bph1, visibleToDosen: true },
    { title: 'Open Recruitment Anggota Baru', content: 'PSDM membuka pendaftaran anggota baru sampai akhir bulan ini.', category: 'event', scope: 'DIVISION', author: kadivByDiv['psdm'] },
    { title: 'Open Recruitment Tim Riset', content: 'RION mencari anggota untuk tim riset data, terbuka untuk semua anggota.', category: 'event', scope: 'DIVISION', author: kadivByDiv['rion'] },
    { title: 'Pelatihan Public Speaking', content: 'Pelatihan soft skill untuk anggota baru. Daftar via formulir divisi.', category: 'event', scope: 'DIVISION', author: kadivByDiv['psdm'] },
    { title: 'Website Baru HIMASTA Aktif', content: 'Sistem informasi HIMASTA sudah aktif. Semua pengumuman kini terpusat di aplikasi.', category: 'organisasi', scope: 'DIVISION', author: kadivByDiv['kominfo'] },
    { title: 'Undangan Bakti Sosial', content: 'Bakti sosial & donor darah digelar Juni 2026, ajak keluarga dan teman.', category: 'event', scope: 'DIVISION', author: kadivByDiv['pr'] },
    { title: 'Workshop Dasar Analisis Data', content: 'Workshop untuk umum, gratis dan sertifikat. Daftar sebelum kuota penuh.', category: 'akademik', scope: 'DIVISION', author: kadivByDiv['akademik'] },
  ]
  let announcementCount = 0
  for (const a of announcements) {
    const exists = await prisma.announcement.findFirst({ where: { title: a.title } })
    if (exists) continue
    await prisma.announcement.create({
      data: {
        title: a.title,
        content: a.content,
        category: a.category,
        scope: a.scope,
        divisionId: a.author.divisionId,
        status: 'PUBLISHED',
        authorId: a.author.id,
        approvedById: bph1.id,
        publishedAt: periodDate(8, 10, 8),
        visibleToDosen: a.visibleToDosen ?? false,
      },
    })
    announcementCount++
  }
  console.log(`- ${announcementCount} pengumuman baru`)

  const documents = [
    { title: 'Notulen Rapat Koordinasi PSDM', description: 'Ringkasan hasil rapat rutin PSDM.', category: 'NOTULEN', div: 'psdm', uploader: kadivByDiv['psdm'] },
    { title: 'Notulen Rapat Koordinasi RION', description: 'Ringkasan hasil rapat rutin RION.', category: 'NOTULEN', div: 'rion', uploader: kadivByDiv['rion'] },
    { title: 'Notulen Rapat Koordinasi PR', description: 'Ringkasan hasil rapat rutin PR.', category: 'NOTULEN', div: 'pr', uploader: kadivByDiv['pr'] },
    { title: 'Notulen Rapat Koordinasi KOMINFO', description: 'Ringkasan hasil rapat rutin KOMINFO.', category: 'NOTULEN', div: 'kominfo', uploader: kadivByDiv['kominfo'] },
    { title: 'Notulen Rapat Koordinasi Akademik', description: 'Ringkasan hasil rapat rutin Akademik.', category: 'NOTULEN', div: 'akademik', uploader: kadivByDiv['akademik'] },
    { title: 'Proposal Makrab HIMASTA 2025', description: 'Usulan kegiatan makrab beserta anggaran.', category: 'PROPOSAL', div: 'bph', uploader: bph1 },
    { title: 'Proposal Seminar Nasional Sains Data', description: 'Usulan kegiatan seminar nasional.', category: 'PROPOSAL', div: 'akademik', uploader: kadivByDiv['akademik'] },
    { title: 'LPJ Makrab HIMASTA 2025', description: 'Laporan pertanggungjawaban kegiatan makrab.', category: 'LPJ', div: 'bph', uploader: bph1 },
    { title: 'LPJ Open Recruitment 2025', description: 'Laporan pertanggungjawaban penerimaan anggota.', category: 'LPJ', div: 'psdm', uploader: kadivByDiv['psdm'] },
    { title: 'Modul Pelatihan Analisis Data', description: 'Modul materi pelatihan divisi RION.', category: 'LAINNYA', div: 'rion', uploader: kadivByDiv['rion'] },
  ]
  let documentCount = 0
  for (const d of documents) {
    const exists = await prisma.document.findFirst({ where: { title: d.title } })
    if (exists) continue
    await prisma.document.create({
      data: {
        title: d.title,
        description: d.description,
        category: d.category,
        fileUrl: `https://example.com/${d.category.toLowerCase()}-${d.div}.pdf`,
        fileName: `${d.category.toLowerCase()}-${d.div}.pdf`,
        fileSize: 1024 + Math.floor(rng() * 9000),
        mimeType: 'application/pdf',
        divisionId: divisions[d.div].id,
        uploadedById: d.uploader.id,
      },
    })
    documentCount++
  }
  console.log(`- ${documentCount} dokumen baru`)

  const feedbacks = [
    { content: 'Koordinasi antar divisi perlu lebih rutin lewat kanal yang jelas.', author: bph1, isAnon: false },
    { content: 'Sistem absensi QR jauh lebih efisien daripada absen manual.', author: null, isAnon: true },
    { content: 'Publikasi event ke mahasiswa masih kurang, sering telat tahu.', author: null, isAnon: true },
    { content: 'Bendahara mohon transparansi laporan keuangan per divisi.', author: null, isAnon: true },
    { content: 'Materi rapat sebaiknya dibagikan sebelum rapat dimulai.', author: kadivByDiv['rion'], isAnon: false },
    { content: 'Sarana lab komputer untuk pelatihan mohon diperbaiki.', author: null, isAnon: true },
  ]
  let feedbackCount = 0
  for (const f of feedbacks) {
    const exists = await prisma.feedbackBPH.findFirst({ where: { content: f.content, periodId: period.id } })
    if (exists) continue
    await prisma.feedbackBPH.create({
      data: {
        content: f.content,
        authorId: f.author ? f.author.id : null,
        isAnon: f.isAnon,
        periodId: period.id,
        isRead: rng() < 0.5,
      },
    })
    feedbackCount++
  }
  console.log(`- ${feedbackCount} feedback BPH baru`)

  const threadTitles = [
    ['Ide kegiatan bonding anggota PSDM', 'PSDM'],
    ['Jadwal latihan presentasi anggota', 'PSDM'],
    ['Kumpulan dataset menarik untuk riset', 'RION'],
    ['Diskusi tools analisis data favorit', 'RION'],
    ['Rencana kerjasama dengan kampus lain', 'PR'],
    ['Ide tema bakti sosial berikutnya', 'PR'],
    ['Perbaikan tampilan website HIMASTA', 'KOMINFO'],
    ['Strategi konten media sosial', 'KOMINFO'],
    ['Pembahasan materi mata kuliah statistik', 'Akademik'],
    ['Diskusi jurnal sains data', 'Akademik'],
    ['Rapat kerja dan evaluasi program', 'BPH'],
    ['Aturan baru kehadiran kegiatan', 'BPH'],
  ]
  let threadCount = 0
  let replyCount = 0
  for (const [title, label] of threadTitles) {
    const slug = label === 'Akademik' ? 'akademik' : label.toLowerCase()
    const divId = divisions[slug].id
    const exists = await prisma.discussionThread.findFirst({ where: { title } })
    if (exists) continue
    const author = usersByDiv[slug][Math.floor(rng() * usersByDiv[slug].length)]
    const thread = await prisma.discussionThread.create({
      data: {
        title,
        content: 'Diskusi pembahasan agenda divisi secara terbuka untuk seluruh anggota.',
        divisionId: divId,
        authorId: author.id,
        isPinned: rng() < 0.3,
      },
    })
    threadCount++
    const replyAuthors = usersByDiv[slug]
    const replies = []
    const n = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < n; i++) {
      const ra = replyAuthors[Math.floor(rng() * replyAuthors.length)]
      if (ra.id === author.id) continue
      replies.push({
        threadId: thread.id,
        authorId: ra.id,
        content: 'Setuju, ini langkah yang bagus untuk divisi. Saya siap membantu di bagian pelaksanaan.',
      })
    }
    if (replies.length > 0) {
      const replyResult = await prisma.discussionReply.createMany({ data: replies })
      replyCount += replyResult.count
    }
  }
  console.log(`- ${threadCount} diskusi + ${replyCount} balasan baru`)

  let notificationCount = 0
  for (const u of nonDosen) {
    const exists = await prisma.notification.findFirst({
      where: { userId: u.id, title: 'Selamat bergabung periode 2025/2026' },
    })
    if (!exists) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          title: 'Selamat bergabung periode 2025/2026',
          message: `Halo ${u.name.split(' ')[0]}, akunmu aktif di periode 2025/2026. Jangan lupa absen di setiap kegiatan lewat aplikasi.`,
          link: '/kegiatan',
          isRead: rng() < 0.5,
        },
      })
      notificationCount++
    }
  }
  console.log(`- ${notificationCount} notifikasi sambutan`)

  console.log('')
  console.log('Dummy data selesai. Akun contoh (password: himasta123):')
  console.log('  BPH:     ahmad.faizal@himasta.id / nim 23001')
  console.log('  KADIV:   m.rizky.pratama@himasta.id / nim 23014')
  console.log('  ANGGOTA: nadia.putri@himasta.id / nim 23006')
  console.log('  DOSEN:   dr.bambang.wicaksono@himasta.id / nim 23050')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
