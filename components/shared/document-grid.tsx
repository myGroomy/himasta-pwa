'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import { DOC_CATEGORY_LABELS, DOC_CATEGORY_BADGE } from '@/lib/constants'

type DocumentData = {
  id: string
  title: string
  description: string | null
  category: 'NOTULEN' | 'PROPOSAL' | 'LPJ' | 'LAINNYA'
  fileUrl: string
  createdAt: string
  division?: { name: string } | null
  uploadedBy: { name: string }
}

export function DocumentGrid({ documents }: { documents: DocumentData[] }) {
  const [selected, setSelected] = useState<DocumentData | null>(null)

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map((d) => (
          <Card
            key={d.id}
            onClick={() => setSelected(d)}
            className="cursor-pointer transition-all hover:border-primary"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <Badge className={DOC_CATEGORY_BADGE[d.category]}>
                  {DOC_CATEGORY_LABELS[d.category]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {d.division?.name ?? 'General'}
                </span>
              </div>
              <CardTitle className="text-base leading-snug">{d.title}</CardTitle>
              <CardDescription className="line-clamp-2">{d.description ?? '—'}</CardDescription>
            </CardHeader>
            <CardContent
              className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking button
            >
              <span>
                {formatDate(new Date(d.createdAt))} · {d.uploadedBy.name}
              </span>
              <Button asChild size="sm" variant="outline">
                <Link href={d.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3.5 w-3.5" />
                  Buka
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        {selected && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className={DOC_CATEGORY_BADGE[selected.category]}>
                  {DOC_CATEGORY_LABELS[selected.category]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {selected.division?.name ?? 'General'}
                </span>
              </div>
              <DialogTitle className="text-xl leading-snug text-left">{selected.title}</DialogTitle>
              <DialogDescription className="text-left">
                Diunggah oleh {selected.uploadedBy.name} pada {formatDate(new Date(selected.createdAt))}
              </DialogDescription>
            </DialogHeader>

            <div className="border-t border-border pt-4">
              <h4 className="mb-2 text-sm font-semibold">Deskripsi / Detail</h4>
              <p className="text-sm leading-6 text-muted-foreground whitespace-pre-wrap">
                {selected.description ?? 'Tidak ada deskripsi tambahan.'}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-4 w-4" />
                Format File / Dokumen Resmi
              </div>
              <Button asChild>
                <Link href={selected.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Buka / Unduh File
                </Link>
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
