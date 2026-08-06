'use client'

import { useState, useEffect } from 'react'
import { ClipboardCheck, Star, Award, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function EvaluasiProkerDialog({ prokerId, prokerName }: { prokerId: string; prokerName: string }) {
  const [open, setOpen] = useState(false)
  const [whatWorked, setWhatWorked] = useState('')
  const [whatFailed, setWhatFailed] = useState('')
  const [lessons, setLessons] = useState('')
  const [overallRating, setOverallRating] = useState(5)
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState<any>(null)
  const [fetching, setFetching] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setFetching(true)
      fetch(`/api/prokers/${prokerId}/evaluation`)
        .then(r => r.json())
        .then(data => {
          if (data.evaluation) {
            setExisting(data.evaluation)
            setWhatWorked(data.evaluation.whatWorked)
            setWhatFailed(data.evaluation.whatFailed)
            setLessons(data.evaluation.lessons)
            setOverallRating(data.evaluation.overallRating)
          }
        })
        .finally(() => setFetching(false))
    }
  }, [open, prokerId])

  const handleSubmit = async () => {
    if (!whatWorked || !whatFailed || !lessons) return
    setLoading(true)
    try {
      const r = await fetch(`/api/prokers/${prokerId}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatWorked, whatFailed, lessons, overallRating }),
      })
      if (r.ok) {
        setSaved(true)
        setTimeout(() => { setOpen(false); setSaved(false) }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <ClipboardCheck className="h-3.5 w-3.5" />
          {existing ? 'Lihat/Edit Evaluasi' : 'Isi Evaluasi'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Evaluasi Post-Mortem: {prokerName}
          </DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : saved ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="font-semibold">Evaluasi Berhasil Disimpan!</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Rating Keseluruhan (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setOverallRating(r)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`h-6 w-6 ${r <= overallRating ? 'fill-amber-400' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Apa yang Berhasil? (What Worked)</label>
              <Textarea
                placeholder="Pencapaian, efisiensi kerja, faktor sukses..."
                value={whatWorked}
                onChange={e => setWhatWorked(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Apa yang Perlu Diperbaiki? (What Failed)</label>
              <Textarea
                placeholder="Kendala, hambatan, kekurangan..."
                value={whatFailed}
                onChange={e => setWhatFailed(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Pelajaran &amp; Rekomendasi (Lessons Learned)</label>
              <Textarea
                placeholder="Saran untuk kepengurusan/proker selanjutnya..."
                value={lessons}
                onChange={e => setLessons(e.target.value)}
                rows={2}
              />
            </div>

            <Button onClick={handleSubmit} disabled={loading || !whatWorked || !whatFailed || !lessons} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Evaluasi'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
