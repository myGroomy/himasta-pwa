'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Edit, LogOut, CheckCircle2, Award, Calendar, Clock, MapPin, QrCode, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { formatDate } from '@/lib/utils'

type Registration = {
  id: string
  eventId: string
  attended: boolean
  createdAt: Date | string
  event: {
    id: string
    name: string
    startTime: Date | string
    division: { name: string } | null
  }
}

type ProfileActionsProps = {
  initialPhone: string
  initialPhotoUrl: string
  registrations: Registration[]
}

export function ProfileActions({ initialPhone, initialPhotoUrl, registrations }: ProfileActionsProps) {
  const router = useRouter()
  const [phone, setPhone] = useState(initialPhone)
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Sertifikat state
  const [selectedCert, setSelectedCert] = useState<any | null>(null)
  const [loadingCert, setLoadingCert] = useState(false)


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

      {/* Riwayat Event & Sertifikat */}
      <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm mt-6">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Riwayat Event & Sertifikat
        </h3>
        <div className="space-y-2">
          {registrations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Belum ada riwayat pendaftaran event.</p>
          ) : (
            registrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between rounded-xl bg-secondary/35 p-3 border border-border text-sm">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground text-xs leading-tight line-clamp-1">{reg.event.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(reg.event.startTime)}
                  </p>
                </div>
                {reg.attended ? (
                  <Button
                    size="sm"
                    onClick={async () => {
                      setLoadingCert(true)
                      try {
                        const res = await fetch(`/api/events/${reg.event.id}/certificate?registrationId=${reg.id}`)
                        const data = await res.json()
                        if (data.certificate) {
                          setSelectedCert(data.certificate)
                        }
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setLoadingCert(false)
                      }
                    }}
                    className="h-7 text-[10px] bg-primary text-primary-foreground hover:opacity-90 px-3 py-1"
                  >
                    Sertifikat
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-[9px] h-5">Terdaftar</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Certificate Modal — link diisi BPH/Kadiv */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col transform transition-all duration-300">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Sertifikat Digital</h3>
              <button
                onClick={() => setSelectedCert(null)}
                aria-label="Tutup"
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="border border-dashed border-primary/20 rounded-xl p-4 bg-primary/5 text-center space-y-2">
                <Award className="h-10 w-10 text-primary mx-auto" />
                <p className="text-sm font-bold text-foreground">{selectedCert.eventName}</p>
                {selectedCert.url ? (
                  <p className="text-xs text-muted-foreground">
                    Sertifikat Anda tersedia. Klik tombol di bawah untuk membuka.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Link sertifikat belum tersedia. Hubungi panitia/BPH.
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/20">
              {selectedCert.url ? (
                <Button size="sm" asChild className="gap-1.5">
                  <a href={selectedCert.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Buka Sertifikat
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setSelectedCert(null)}>
                  Tutup
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Scan Floating Button */}
      <div className="fixed bottom-24 right-6 z-45">
        <Button asChild size="icon" className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-95">
          <Link href="/kegiatan/scan">
            <QrCode className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
