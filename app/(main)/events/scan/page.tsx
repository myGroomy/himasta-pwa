import { requireRole } from '@/lib/permissions'
import { PageHeader } from '@/components/shared/page-header'
import { EventQrScanner } from '@/components/shared/event-qr-scanner'

export const dynamic = 'force-dynamic'

export default async function EventScanPage() {
  await requireRole(['KADIV', 'BPH'])

  return (
    <div>
      <PageHeader
        title="Scan QR Peserta"
        description="Pindai QR peserta event (anggota atau eksternal) untuk mencatat kehadiran."
      />
      <EventQrScanner />
    </div>
  )
}
