'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Download, Edit, LogOut, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import html2canvas from 'html2canvas'

type ProfileActionsProps = {
  initialPhone: string
  initialPhotoUrl: string
}

export function ProfileActions({ initialPhone, initialPhotoUrl }: ProfileActionsProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(initialPhone)
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = async () => {
    const cardElement = document.getElementById('member-card')
    if (!cardElement) return
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(cardElement, { scale: 2, backgroundColor: null })
      const link = document.createElement('a')
      link.download = 'Kartu-Anggota-HIMASTA.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error('Failed to generate card', e)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, photoUrl }),
      })
      if (res.ok) {
        setIsOpen(false)
        router.refresh()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleDownload} disabled={isDownloading} variant="outline" className="flex-1 gap-2 border-border">
          <Download className="h-4 w-4" />
          {isDownloading ? 'Memproses...' : 'Unduh Kartu'}
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="flex-1 gap-2">
              <Edit className="h-4 w-4" />
              Edit Profil
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profil</DialogTitle>
              <DialogDescription>
                Perbarui informasi kontak dan foto profil Anda.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">No. WhatsApp / HP</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoUrl">URL Foto Profil (Opsional)</Label>
                <Input
                  id="photoUrl"
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Button
        onClick={async () => {
          await signOut({ redirect: false })
          router.push('/')
          router.refresh()
        }}
        variant="destructive"
        className="w-full gap-2 font-semibold"
      >
        <LogOut className="h-4 w-4" />
        Keluar Aplikasi
      </Button>
    </div>
  )
}
