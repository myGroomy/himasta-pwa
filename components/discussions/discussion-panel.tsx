'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  MessageSquare, Plus, Send, ChevronRight, X,
  PinIcon, Loader2, Users, Clock
} from 'lucide-react'
import { ROLE_LABELS } from '@/lib/constants'

type Thread = {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  author: { name: string; role: string }
  _count: { replies: number }
}

type Reply = {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string; role: string }
}

type ThreadDetail = Thread & { replies: Reply[] }

export function DiscussionPanel({
  divisionId,
  currentUserId,
  canPost,
}: {
  divisionId: string
  currentUserId: string
  canPost: boolean
}) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', content: '' })
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadThreads = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/discussions?divisionId=${divisionId}`)
      if (r.ok) {
        const data = await r.json()
        setThreads(data.threads)
      }
    } finally {
      setLoading(false)
    }
  }, [divisionId])

  const openThread = async (id: string) => {
    const r = await fetch(`/api/discussions/${id}/replies`)
    if (r.ok) {
      const data = await r.json()
      setActiveThread(data.thread)
    }
  }

  useEffect(() => { loadThreads() }, [loadThreads])

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim()) return
    setSubmitting(true)
    try {
      const r = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newThread, divisionId }),
      })
      if (r.ok) {
        setShowNew(false)
        setNewThread({ title: '', content: '' })
        await loadThreads()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !activeThread) return
    setSubmitting(true)
    try {
      const r = await fetch(`/api/discussions/${activeThread.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText }),
      })
      if (r.ok) {
        setReplyText('')
        await openThread(activeThread.id)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const roleColor: Record<string, string> = {
    BPH: 'bg-indigo-100 text-indigo-700',
    KADIV: 'bg-violet-100 text-violet-700',
    ANGGOTA: 'bg-slate-100 text-slate-700',
    DOSEN: 'bg-green-100 text-green-700',
  }

  // Thread detail view
  if (activeThread) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveThread(null)}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            ← Kembali
          </button>
          <span className="text-muted-foreground">·</span>
          <h3 className="font-semibold truncate">{activeThread.title}</h3>
        </div>

        {/* Original post */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {activeThread.author.name.split(' ').map(n => n[0]).slice(0,2).join('')}
            </div>
            <div>
              <p className="text-sm font-medium">{activeThread.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(activeThread.createdAt), 'd MMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>
            <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${roleColor[activeThread.author.role] ?? ''}`}>
              {ROLE_LABELS[activeThread.author.role as keyof typeof ROLE_LABELS] ?? activeThread.author.role}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{activeThread.content}</p>
        </div>

        {/* Replies */}
        <div className="space-y-2 pl-6 border-l-2 border-muted">
          {activeThread.replies.map(reply => (
            <div key={reply.id} className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {reply.author.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <p className="text-sm font-medium">{reply.author.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs ${roleColor[reply.author.role] ?? ''}`}>
                  {ROLE_LABELS[reply.author.role as keyof typeof ROLE_LABELS] ?? reply.author.role}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(reply.createdAt), 'd MMM, HH:mm', { locale: id })}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap pl-9">{reply.content}</p>
            </div>
          ))}
          {activeThread.replies.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground text-center">Belum ada balasan. Jadilah yang pertama!</p>
          )}
        </div>

        {/* Reply input */}
        <div className="flex gap-2 items-end">
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Tulis balasan..."
            rows={2}
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleReply}
            disabled={submitting || !replyText.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Diskusi Divisi
        </h2>
        {canPost && (
          <button
            onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
          >
            {showNew ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showNew ? 'Batal' : 'Thread Baru'}
          </button>
        )}
      </div>

      {showNew && (
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <input
            type="text"
            placeholder="Judul diskusi..."
            value={newThread.title}
            onChange={e => setNewThread(p => ({ ...p, title: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            placeholder="Isi diskusi..."
            rows={4}
            value={newThread.content}
            onChange={e => setNewThread(p => ({ ...p, content: e.target.value }))}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleCreateThread}
            disabled={submitting || !newThread.title.trim() || !newThread.content.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Buat Thread
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-muted-foreground">
          <MessageSquare className="h-8 w-8 opacity-40" />
          <p className="text-sm">Belum ada thread diskusi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              className="w-full text-left rounded-xl border bg-card px-4 py-3.5 hover:bg-accent/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                {t.isPinned && <PinIcon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {t.author.name}
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    {format(new Date(t.updatedAt), 'd MMM yyyy', { locale: id })}
                    <span>·</span>
                    <MessageSquare className="h-3 w-3" />
                    {t._count.replies} balasan
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
