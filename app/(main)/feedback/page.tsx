'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquarePlus, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function FeedbackPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isAnon, setIsAnon] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, isAnon })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengirim kritik dan saran')
      }

      setSuccess(true)
      setContent('')
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg mt-12 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
          <MessageSquarePlus className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Terima Kasih!</h2>
        <p className="text-muted-foreground">Kritik dan saran Anda telah berhasil dikirimkan ke BPH. Masukan Anda sangat berarti bagi perkembangan HIMASTA.</p>
        <Button onClick={() => router.push('/')} variant="outline" className="mt-4">Kembali ke Beranda</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-primary" />
            Kritik & Saran
          </CardTitle>
          <CardDescription>
            Sampaikan kritik, saran, atau masukan Anda untuk kepengurusan HIMASTA saat ini. 
            Anda dapat memilih untuk mengirimkannya secara anonim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Textarea 
                placeholder="Tuliskan masukan Anda di sini..." 
                className="min-h-[150px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-3">
              <Switch 
                id="anon" 
                checked={isAnon} 
                onCheckedChange={setIsAnon} 
                disabled={isSubmitting}
              />
              <Label htmlFor="anon" className="flex flex-col gap-1 cursor-pointer">
                <span>Kirim sebagai Anonim</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Nama Anda tidak akan ditampilkan kepada BPH.
                </span>
              </Label>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting || !content.trim()}>
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Mengirim...' : 'Kirim Masukan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
