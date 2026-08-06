import { requireSession } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { DocumentUploadForm } from '@/components/shared/document-upload-form'
import { DocumentGrid } from '@/components/shared/document-grid'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DOC_CATEGORY_LABELS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function DokumenPage() {
  const user = await requireSession()

  const documentWhere =
    user.role === 'BPH'
      ? {}
      : user.role === 'DOSEN'
        ? { divisionId: null }
        : { OR: [{ divisionId: user.divisionId ?? '__none__' }, { divisionId: null }] }

  const [documents, divisions] = await Promise.all([
    prisma.document.findMany({
      where: documentWhere,
      include: {
        division: { select: { id: true, name: true, slug: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.division.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])

  const serializedDocs = documents.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  }))

  const canUpload = user.role === 'KADIV' || user.role === 'BPH'
  const categories = ['NOTULEN', 'PROPOSAL', 'LPJ', 'LAINNYA'] as const

  return (
    <div>
      <PageHeader
        title="Arsip Dokumen"
        description="Notulen, proposal, dan LPJ tersimpan dan bisa diakses ulang."
        action={
          canUpload ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Upload Dokumen</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Dokumen</DialogTitle>
                  <DialogDescription>
                    Simpan dokumen ke arsip. Upload ke divisi Anda langsung tersedia untuk anggota divisi.
                  </DialogDescription>
                </DialogHeader>
                <DocumentUploadForm divisions={divisions} userDivisionId={user.divisionId} isBPH={user.role === 'BPH'} />
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="all">Semua</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c} value={c}>
              {DOC_CATEGORY_LABELS[c]}
            </TabsTrigger>
          ))}
        </TabsList>

        {['all', ...categories].map((tab) => {
          const filtered = tab === 'all' ? serializedDocs : serializedDocs.filter((d) => d.category === tab)
          return (
            <TabsContent key={tab} value={tab}>
              {filtered.length === 0 ? (
                <EmptyState title="Tidak ada dokumen" description="Belum ada dokumen pada kategori ini." />
              ) : (
                <DocumentGrid documents={filtered as any} />
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
