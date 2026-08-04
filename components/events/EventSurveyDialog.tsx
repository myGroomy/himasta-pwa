'use client'

import { useState } from 'react'
import { Star, MessageSquareHeart, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function EventSurveyDialog({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await fetch(`/api/events/${eventId}/survey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, isAnon }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setSubmitted(true)
      setTimeout(() => { setOpen(false); setSubmitted(false) }, 1500)
    } catch (e: any) {
      setError(e.message || 'Gagal mengirim survey')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs border-pink-200 text-pink-700 hover:bg-pink-50">
          <MessageSquareHeart className="h-3.5 w-3.5 text-pink-500" />
          Survey Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-pink-700">
            <MessageSquareHeart className="h-5 w-5" />
            Survey Kepuasan: {eventName}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="font-semibold">Terima kasih atas ulasanmu!</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {error && <p className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">{error}</p>}
            <div>
              <label className="mb-1 block text-sm font-medium">Bintang Kepuasan (1-5)</label>
              <div className="flex gap-1 justify-center py-2">
                {[1, 2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRating(r)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star className={`h-8 w-8 ${r <= rating ? 'fill-amber-400' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Kritik, Saran, atau Kesan</label>
              <Textarea
                placeholder="Apa yang paling kamu suka dari event ini?"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnon}
                  onChange={e => setIsAnon(e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                Kirim secara Anonim
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kirim Survey'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
