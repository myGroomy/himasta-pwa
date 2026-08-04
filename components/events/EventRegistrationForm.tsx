'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Ticket, CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { toast } from '@/components/ui/use-toast'
import QRCode from 'qrcode'

type EventRegistrationFormProps = {
  eventId: string
  eventName: string
  session: any
}

export function EventRegistrationForm({ eventId, eventName, session }: EventRegistrationFormProps) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    institution: '',
  })
  
  const [ticketData, setTicketData] = useState<{ qrToken: string, name: string } | null>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendaftar event')
      }

      toast({ title: 'Berhasil mendaftar!', variant: 'success' })
      setTicketData({ qrToken: data.qrToken, name: data.name })
      
      // Generate QR Code image
      const qrDataUrl = await QRCode.toDataURL(data.qrToken, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      setQrImageUrl(qrDataUrl)
      
      router.refresh()
    } catch (err: any) {
      toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTicket = () => {
    if (!qrImageUrl) return
    const a = document.createElement('a')
    a.href = qrImageUrl
    a.download = `Tiket-${eventName.replace(/\s+/g, '-')}-${ticketData?.name}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (ticketData && qrImageUrl) {
    return (
      <Card className="w-full max-w-md mx-auto border-primary/20 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-primary p-6 text-primary-foreground text-center flex flex-col items-center">
          <CheckCircle2 className="h-12 w-12 mb-2" />
          <h3 className="text-xl font-bold">Pendaftaran Sukses!</h3>
          <p className="text-primary-foreground/80 text-sm mt-1">Ini adalah tiket digital Anda.</p>
        </div>
        <CardContent className="p-8 flex flex-col items-center space-y-6">
          <div className="text-center w-full border-b pb-4">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-1">Nama Pendaftar</p>
            <p className="text-xl font-bold">{ticketData.name}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-[#EAEAEA] shadow-inner">
            <img src={qrImageUrl} alt="QR Code Tiket" className="w-48 h-48 mx-auto" />
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Tunjukkan kode QR ini kepada panitia saat registrasi ulang di lokasi event.
          </p>

          <Button onClick={handleDownloadTicket} className="w-full gap-2 rounded-full h-12 shadow-md">
            <Download className="h-4 w-4" />
            Unduh Tiket
          </Button>
        </CardContent>
      </Card>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Contoh: Budi Santoso"
          required 
          disabled={!!session?.user?.name}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Alamat Email</Label>
        <Input 
          id="email" 
          type="email"
          value={formData.email} 
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Contoh: budi@gmail.com"
          required 
          disabled={!!session?.user?.email}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">No. WhatsApp</Label>
        <Input 
          id="phone" 
          type="tel"
          value={formData.phone} 
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Contoh: 08123456789"
          required 
        />
      </div>

      {!session && (
        <div className="space-y-2">
          <Label htmlFor="institution">Instansi / Asal Universitas</Label>
          <Input 
            id="institution" 
            value={formData.institution} 
            onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
            placeholder="Contoh: Universitas Logistik dan Bisnis Internasional"
          />
        </div>
      )}

      <Button type="submit" className="w-full h-12 text-md font-semibold mt-6" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Daftar Sekarang'}
      </Button>
    </form>
  )

  if (session) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg border-[#EAEAEA]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Ticket className="h-6 w-6 text-primary" />
            Registrasi Event
          </CardTitle>
          <CardDescription>Konfirmasi data diri Anda untuk mendaftar.</CardDescription>
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="anggota" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="anggota">Anggota HIMASTA</TabsTrigger>
          <TabsTrigger value="umum">Umum</TabsTrigger>
        </TabsList>
        
        <TabsContent value="anggota">
          <Card className="shadow-lg border-[#EAEAEA]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ticket className="h-5 w-5 text-primary" />
                Login Anggota
              </CardTitle>
              <CardDescription>
                Silakan login dengan akun HIMASTA Anda untuk mendaftar secara otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full h-12 text-md font-semibold mt-2">
                <Link href={`/login?callbackUrl=/events/${eventId}`}>
                  Login Sekarang
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="umum">
          <Card className="shadow-lg border-[#EAEAEA]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ticket className="h-5 w-5 text-primary" />
                Registrasi Umum
              </CardTitle>
              <CardDescription>
                Isi form berikut untuk mendaftar sebagai peserta umum.
              </CardDescription>
            </CardHeader>
            <CardContent>{formContent}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
