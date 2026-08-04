'use client'

import { useState } from 'react'
import { MessageSquarePlus, Send, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'

export function FeedbackForm() {
  const [content, setContent] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      setError('Tulis minimal 10 karakter')
      return
    }
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isAnon }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error)
      setSuccess(true)
      setContent('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim feedback')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Feedback Terkirim!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Terima kasih. Kritik &amp; saran kamu akan dibaca BPH.
          </p>
        </div>
        <button
          onClick={() => { setSuccess(false) }}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-accent"
        >
          Kirim Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquarePlus className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Kritik &amp; Saran ke BPH</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Sampaikan masukan, ide, atau kritik untuk organisasi. Kamu bisa memilih untuk mengirim secara anonim BPH tidak akan tahu siapa kamu.
      </p>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Tulis masukan atau saran kamu di sini..."
        rows={5}
        className="w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setIsAnon(v => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors ${isAnon ? 'bg-primary' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isAnon ? 'translate-x-4' : ''}`} />
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <EyeOff className={`h-3.5 w-3.5 ${isAnon ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className={isAnon ? 'font-medium text-primary' : 'text-muted-foreground'}>
              Kirim secara anonim
            </span>
          </div>
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading || content.trim().length < 10}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Kirim Feedback
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {content.length}/500 karakter
        {isAnon && ' · Mode anonim aktif identitasmu tidak akan direkam'}
      </p>
    </div>
  )
}
