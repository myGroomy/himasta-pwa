# Agents Documentation — Sistem HIMASTA

> **Status:** Active | **Versi:** 1.0 | **Terakhir diperbarui:** 2026-08-02
> **Terkait:** PRD_V3.md, TDD.md

---

## 1. Pengantar

Dokumen ini mendefinisikan specialized agents yang dirancang untuk membantu pembangunan, deployment, dan maintenance sistem informasi HIMASTA dari V1 hingga V3. Setiap agent memiliki tanggung jawab spesifik dan konteks yang jelas untuk memaksimalkan efisiensi development.

## 2. Daftar Agents

### 2.1 Schema Architect Agent

**Nama:** `schema-architect`

**Tujuan:** Mengelola evolusi database schema dari V1 → V2 → V3 dengan memastikan backward compatibility dan zero-downtime migration.

**Tanggung Jawab:**
- Review dan validasi perubahan Prisma schema
- Membuat migration scripts yang aman
- Memastikan foreign key relationships tetap valid saat penambahan tabel baru
- Memvalidasi enum changes yang tidak breaking
- Membuat data seeding strategy untuk testing

**Konteks yang Dibutuhkan:**
- Current Prisma schema (`/prisma/schema.prisma`)
- Migration history
- PRD untuk fase yang sedang dikerjakan

**Output:**
- Updated schema file
- Migration scripts dengan rollback plan
- Validation report
- Seed data scripts

**Kriteria Sukses:**
- Migration berjalan tanpa data loss
- Semua relasi database tetap konsisten
- Performance query tidak degradasi setelah migration

---

### 2.2 RBAC Guardian Agent

**Nama:** `rbac-guardian`

**Tujuan:** Memastikan implementasi role-based access control (RBAC) konsisten di seluruh aplikasi dan tidak ada security holes.

**Tanggung Jawab:**
- Review setiap Route Handler untuk validasi authorization
- Memastikan row-level scoping diterapkan di query Prisma
- Validasi middleware auth di protected routes
- Check permission logic untuk fitur baru
- Membuat test cases untuk authorization scenarios

**Konteks yang Dibutuhkan:**
- `/app/api/**/*.ts` (semua Route Handlers)
- `/lib/permissions.ts`
- Role definitions dari schema
- PRD untuk memahami business rules

**Output:**
- Authorization audit report
- Fixed route handlers dengan proper checks
- Unit tests untuk permission logic
- Documentation untuk permission matrix

**Kriteria Sukses:**
- Zero unauthorized access dalam security testing
- Semua API endpoints memiliki proper authorization
- Permission logic mudah dipahami dan di-maintain

---

### 2.3 Feature Module Builder Agent

**Nama:** `feature-builder`

**Tujuan:** Membangun modul fitur lengkap end-to-end (API + UI + State Management) mengikuti pattern yang sudah established.

**Tanggung Jawab:**
- Membuat Route Handlers untuk modul baru
- Implementasi UI components (Server & Client Components)
- Setup state management jika diperlukan
- Integrasi dengan existing modules
- Membuat form validation schemas (Zod)

**Konteks yang Dibutuhkan:**
- PRD untuk fitur yang akan dibangun
- Existing code patterns (`/app/(main)/**`, `/app/api/**`)
- UI component library (`/components/ui`)
- Schema Prisma untuk data model

**Output:**
- Complete feature implementation:
  - API routes (`/app/api/[module]/*`)
  - Page components (`/app/(main)/[module]/*`)
  - Reusable components (`/components/[module]/*`)
  - Type definitions
  - Basic unit tests

**Kriteria Sukses:**
- Fitur berjalan sesuai PRD
- Code style konsisten dengan codebase existing
- Proper error handling
- TypeScript strict mode compliance

---

### 2.4 QR System Specialist Agent

**Nama:** `qr-specialist`

**Tujuan:** Mengelola semua aspek sistem QR untuk absensi, termasuk generation, validation, security, dan scanning experience.

**Tanggung Jawab:**
- Implement secure QR generation dengan expiry token
- Handle QR scanning di client-side (camera access)
- Validasi token server-side dengan anti-replay protection
- Error handling untuk failed scans
- Performance optimization untuk scan speed

**Konteks yang Dibutuhkan:**
- AttendanceSession model
- AttendanceRecord model
- `/app/api/attendance/**` endpoints
- Camera permission handling di browser/PWA

**Output:**
- QR generation API endpoint
- QR scanning UI component
- Token validation middleware
- Security audit report
- User guide untuk troubleshooting scan issues

**Kriteria Sukses:**
- QR generation < 500ms
- Scan success rate > 95%
- Zero token replay vulnerabilities
- Graceful degradation jika kamera tidak available

---

### 2.5 PWA Optimizer Agent

**Nama:** `pwa-optimizer`

**Tujuan:** Memastikan aplikasi berjalan optimal sebagai Progressive Web App dengan offline capability dan native-like experience.

**Tanggung Jawab:**
- Configure service worker untuk caching strategy
- Optimize manifest.json
- Implement offline fallback pages
- Handle install prompts
- Test PWA features across devices (iOS/Android/Desktop)

**Konteks yang Dibutuhkan:**
- Next.js PWA configuration
- Asset optimization requirements
- Network conditions testing
- Device compatibility matrix

**Output:**
- Optimized service worker config
- Cache strategy documentation
- PWA installation guide untuk users
- Performance audit report (Lighthouse)
- Device compatibility report

**Kriteria Sukses:**
- Lighthouse PWA score > 90
- Offline mode berfungsi untuk core features
- Install success rate > 80% pada supported browsers
- Load time < 3s on 3G connection

---

### 2.6 Data Migration Agent

**Nama:** `data-migrator`

**Tujuan:** Menangani migrasi data saat pergantian periode kepengurusan (V3) dan transformasi data antara versi major.

**Tanggung Jawab:**
- Membuat script migrasi periode kepengurusan
- Backup & restore procedures
- Data transformation untuk status alumni
- Historical data preservation
- Rollback mechanisms

**Konteks yang Dibutuhkan:**
- User model dengan periode/jabatan
- Division assignments history
- Arsip requirements dari PRD V3
- Backup storage strategy

**Output:**
- Migration scripts dengan dry-run mode
- Backup automation scripts
- Data validation checks pre & post migration
- Migration playbook untuk BPH
- Rollback procedures

**Kriteria Sukses:**
- Zero data loss dalam migrasi
- Migrasi < 5 menit untuk 500 users
- Successful rollback testing
- Clear audit trail dari semua perubahan data

---

### 2.7 Analytics Dashboard Agent

**Nama:** `analytics-builder`

**Tujuan:** Membangun dashboard analytics dan reporting system untuk BPH (V3) dengan visualisasi data yang meaningful.

**Tanggung Jawab:**
- Aggregate attendance data across periods
- Calculate member activity metrics
- Build project progress tracking dashboard
- Implement comparative analytics antar periode
- Export functionality ke Excel

**Konteks yang Dibutuhkan:**
- Historical data dari V1/V2 (minimal 1-2 periode)
- Attendance, Proker, Task models
- PRD V3 analytics requirements
- Visualization library (Recharts/Chart.js)

**Output:**
- Dashboard pages untuk BPH
- API endpoints untuk analytics data
- Chart components yang reusable
- Export functions (CSV/Excel)
- Analytics documentation untuk interpretation

**Kriteria Sukses:**
- Dashboard load time < 2s dengan 2 periode data
- Visualisasi mudah dipahami non-technical users
- Export data akurat 100%
- Support drill-down untuk detail per divisi

---

### 2.8 Search Engine Agent

**Nama:** `search-engineer`

**Tujuan:** Implementasi advanced search lintas modul (V3) dengan filtering dan relevance ranking.

**Tanggung Jawab:**
- Design full-text search indexing strategy
- Implement search API dengan multi-table queries
- Build search UI dengan filters dan facets
- Performance optimization untuk large datasets
- Relevance tuning

**Konteks yang Dibutuhkan:**
- All searchable models (Announcement, Document, Proker, Event)
- PostgreSQL full-text search capabilities
- PRD V3 search requirements
- User search behavior patterns

**Output:**
- Unified search API endpoint
- Search indexing setup
- Search UI component dengan filters
- Performance benchmarks
- Search relevance tuning guide

**Kriteria Sukses:**
- Search latency < 500ms untuk 10,000+ records
- Hasil search relevant (precision > 80%)
- Support typo tolerance
- Filter combinations work seamlessly

---

### 2.9 Integration Manager Agent

**Nama:** `integration-manager`

**Tujuan:** Mengelola integrasi dengan external services (Google Calendar, Drive) untuk V3.

**Tanggung Jawab:**
- Implement OAuth flow untuk Google services
- Calendar sync (HIMASTA → Google Calendar)
- Drive linking untuk documents
- Handle token refresh dan auth errors
- Privacy & permission management

**Konteks yang Dibutuhkan:**
- Google API credentials
- NextAuth configuration
- User preferences model
- Sync strategy (one-way vs two-way)

**Output:**
- OAuth implementation dengan Google
- Calendar sync service
- Drive integration untuk document linking
- Integration settings UI
- Error handling & logging
- Privacy policy updates

**Kriteria Sukses:**
- OAuth success rate > 95%
- Sync lag < 5 minutes
- Graceful degradation jika integration fails
- Clear user consent flow

---

### 2.10 Testing Automation Agent

**Nama:** `test-automator`

**Tujuan:** Membangun comprehensive test suite (unit, integration, e2e) untuk memastikan reliability sistem.

**Tanggung Jawab:**
- Write unit tests untuk business logic
- Integration tests untuk API endpoints
- E2E tests untuk critical user flows
- Setup CI/CD pipeline dengan test automation
- Maintain test coverage > 70%

**Konteks yang Dibutuhkan:**
- Entire codebase
- Critical user journeys dari PRD
- Testing framework (Jest, React Testing Library, Playwright)
- CI/CD environment

**Output:**
- Test suites untuk semua modules
- E2E test scenarios
- CI/CD configuration
- Test coverage reports
- Testing documentation & guidelines

**Kriteria Sukses:**
- Test coverage > 70% untuk business logic
- E2E tests cover 100% critical flows
- CI/CD runs tests automatically on PR
- Flaky test rate < 5%

---

### 2.11 Performance Auditor Agent

**Nama:** `perf-auditor`

**Tujuan:** Continuous monitoring dan optimization untuk performance aplikasi (loading, rendering, API response time).

**Tanggung Jawab:**
- Run Lighthouse audits regularly
- Database query optimization
- Image & asset optimization
- Code splitting & lazy loading
- Monitoring setup (response times, error rates)

**Konteks yang Dibutuhkan:**
- Application codebase
- Database query patterns
- User traffic patterns
- Hosting environment (Vercel, Supabase)

**Output:**
- Performance audit reports
- Optimization recommendations & implementations
- Monitoring dashboard setup
- Performance budgets
- Optimization playbook

**Kriteria Sukses:**
- Lighthouse Performance score > 90
- API response time p95 < 500ms
- First Contentful Paint < 1.5s
- Zero performance regressions in releases

---

### 2.12 Documentation Keeper Agent

**Nama:** `doc-keeper`

**Tujuan:** Maintain comprehensive documentation untuk developer onboarding, user guides, dan API references.

**Tanggung Jawab:**
- Keep technical documentation up-to-date
- Generate API documentation dari code
- Create user guides untuk setiap modul
- Maintain changelog untuk setiap release
- Onboarding guide untuk new developers

**Konteks yang Dibutuhkan:**
- All code changes
- PRD documents
- User feedback
- Architecture decisions

**Output:**
- Updated technical docs
- API reference (auto-generated)
- User guides dengan screenshots
- CHANGELOG.md
- Developer onboarding checklist

**Kriteria Sukses:**
- Documentation dianggap helpful (user feedback)
- New developer onboarding < 1 minggu
- API docs 100% coverage
- Docs updated within 1 week setelah feature release

---

## 3. Agent Collaboration Workflows

### 3.1 Adding New Feature Module (V2/V3)

**Workflow:**
1. **Feature Builder** → Create initial implementation
2. **Schema Architect** → Review/update database schema
3. **RBAC Guardian** → Validate authorization logic
4. **Test Automator** → Write test coverage
5. **Doc Keeper** → Update documentation
6. **Perf Auditor** → Performance check before merge

### 3.2 Periode Kepengurusan Migration (V3)

**Workflow:**
1. **Schema Architect** → Prepare schema untuk historis jabatan
2. **Data Migrator** → Create & test migration script
3. **Feature Builder** → Build UI untuk regenerasi flow
4. **RBAC Guardian** → Validate permission changes
5. **Test Automator** → E2E test full migration flow
6. **Doc Keeper** → Create migration playbook untuk BPH

### 3.3 Analytics Dashboard Implementation (V3)

**Workflow:**
1. **Schema Architect** → Optimize queries untuk aggregation
2. **Analytics Builder** → Build dashboard & visualizations
3. **RBAC Guardian** → Ensure only BPH can access sensitive metrics
4. **Perf Auditor** → Optimize dashboard load time
5. **Doc Keeper** → Create interpretation guide untuk BPH

### 3.4 External Integration (Google Calendar/Drive)

**Workflow:**
1. **Integration Manager** → Implement OAuth & sync
2. **RBAC Guardian** → User consent & privacy validation
3. **Feature Builder** → Build settings UI
4. **Test Automator** → Test auth flows & edge cases
5. **Doc Keeper** → User guide untuk setup integration

---

## 4. Agent Best Practices

### 4.1 Context Gathering
- Selalu baca PRD fase terkait sebelum memulai
- Review existing code patterns sebelum implement
- Check related modules untuk consistency

### 4.2 Communication
- Document keputusan desain di code comments
- Flag breaking changes early ke dependent agents
- Update shared docs (TDD, schema) saat ada perubahan

### 4.3 Testing Before Handoff
- Self-test implementation sebelum pass ke agent lain
- Validate against acceptance criteria di PRD
- Run existing tests untuk ensure tidak break

### 4.4 Security First
- RBAC Guardian always validates sebelum merge
- Data Migrator always creates backup
- Integration Manager always respects user consent

---

## 5. Agent Invocation Guidelines

### 5.1 Kapan Invoke Agent vs DIY

**Invoke Agent jika:**
- Task membutuhkan specialized knowledge (security, performance)
- Cross-cutting concern yang affect multiple modules
- One-time complex task (migration, integration setup)
- Need consistent pattern across codebase

**DIY (tanpa agent) jika:**
- Simple CRUD operation
- Styling/UI tweaks
- Bug fix yang localized
- Documentation typo fixes

### 5.2 Providing Context ke Agent

**Minimal Context:**
- Tujuan task (apa yang ingin dicapai)
- Files/modules terkait
- Acceptance criteria
- Dependencies ke modules lain

**Optimal Context:**
- Link ke PRD/TDD section terkait
- Examples dari existing code
- Known constraints (performance, security)
- Expected edge cases

---

## 6. Maintenance & Evolution

### 6.1 Adding New Agents

**Kriteria untuk Agent Baru:**
- Specialized domain knowledge required
- Repeated task pattern across project phases
- Cross-cutting concern yang butuh consistency
- High impact/risk yang butuh dedicated focus

**Process:**
1. Identify need dari development bottlenecks
2. Define agent scope & responsibilities
3. Document di agents.md
4. Create collaboration workflows dengan existing agents
5. Test dengan 1-2 real tasks sebelum full adoption

### 6.2 Deprecating Agents

**Kriteria Deprecation:**
- Task sudah selesai & tidak recurring (ex: initial PWA setup)
- Responsibility absorbed by other agents
- Tooling changes membuat agent obsolete

**Process:**
1. Mark agent sebagai deprecated di docs
2. Redirect workflows ke alternative agent
3. Archive agent documentation untuk reference
4. Remove after 1 version cycle tanpa usage

---

## 7. Metrics & Success Tracking

| Agent | Key Metric | Target |
|---|---|---|
| Schema Architect | Migration success rate | 100% |
| RBAC Guardian | Security issues found pre-release | 0 critical |
| Feature Builder | Time to implement standard CRUD | < 4 hours |
| QR Specialist | Scan success rate | > 95% |
| PWA Optimizer | Lighthouse PWA score | > 90 |
| Data Migrator | Migration time (500 users) | < 5 minutes |
| Analytics Builder | Dashboard load time | < 2s |
| Search Engineer | Search latency | < 500ms |
| Integration Manager | OAuth success rate | > 95% |
| Test Automator | Code coverage | > 70% |
| Perf Auditor | Performance score | > 90 |
| Doc Keeper | Developer onboarding time | < 1 week |

---

## 8. Quick Reference

**Untuk memulai feature baru:**
```
1. Baca PRD → identify fase & module
2. Invoke Feature Builder dengan context PRD + existing patterns
3. Schema Architect review jika butuh DB changes
4. RBAC Guardian validate authorization
5. Test Automator add test coverage
```

**Untuk migration/data changes:**
```
1. Schema Architect prepare schema changes
2. Data Migrator create scripts dengan backup
3. Test dengan dry-run dulu
4. Doc Keeper create runbook untuk BPH
```

**Untuk optimization:**
```
1. Perf Auditor identify bottlenecks
2. Relevant specialist agent implement fix
3. Perf Auditor validate improvement
4. Doc Keeper update performance guidelines
```

---

**Last Updated:** 2026-08-02
**Maintained by:** Development Team
**Related Docs:** PRD_V3.md, TDD.md, CHANGELOG.md
