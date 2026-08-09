import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventRegistrationForm } from '@/components/events/EventRegistrationForm'

export const dynamic = 'force-dynamic'

export default async function PublicEventPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const eventId = params.id

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      division: true,
      registrations: true,
    }
  })

  if (!event || event.status !== 'PUBLISHED') {
    notFound()
  }

  // Jika event khusus internal dan user belum login, arahkan ke halaman login
  if (event.visibility === 'INTERNAL' && !session) {
    redirect(`/login?callbackUrl=/events/${eventId}`)
  }

  const isFull = event.capacity ? event.registrations.length >= event.capacity : false

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header Minimal */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 -ml-4">
            <Link href="/welcome">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <Image src="/himasta-logo.webp" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold hidden sm:inline-block">HIMASTA</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* Cover Image */}
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden bg-primary/5 border shadow-sm">
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="h-20 w-20 text-primary/20" />
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex px-4 py-1.5 rounded-full text-xs font-bold bg-background/90 backdrop-blur-sm border shadow-sm uppercase tracking-widest text-primary">
              {event.visibility === 'PUBLIC' ? 'Event Umum' : 'Event Internal'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Detail Utama */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">{event.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6 bg-background p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{format(new Date(event.startTime), 'EEEE, dd MMMM yyyy', { locale: localeId })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{format(new Date(event.startTime), 'HH:mm')} - {event.endTime ? format(new Date(event.endTime), 'HH:mm') : 'Selesai'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{event.location || 'TBA'}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-blue max-w-none text-muted-foreground bg-background p-6 md:p-8 rounded-3xl border shadow-sm">
              <h3 className="text-foreground font-bold mb-4">Deskripsi Kegiatan</h3>
              <p className="whitespace-pre-wrap leading-relaxed">
                {event.description || 'Tidak ada deskripsi.'}
              </p>
            </div>
          </div>

          {/* Sidebar / Info & Registrasi */}
          <div className="space-y-6">
            <div className="bg-background rounded-3xl p-6 border shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Penyelenggara</h4>
                <p className="font-bold text-lg">{event.division?.name || 'HIMASTA Pusat (BPH)'}</p>
              </div>

              {event.capacity && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Users className="h-4 w-4" /> Kuota Tersedia
                    </h4>
                    <span className="text-sm font-bold">{event.capacity - event.registrations.length}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all" 
                      style={{ width: `${Math.min((event.registrations.length / event.capacity) * 100, 100)}%` }} 
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-muted-foreground">{event.registrations.length} / {event.capacity} Terdaftar</p>
                </div>
              )}
            </div>

            {/* Form Registrasi / Status Kuota */}
            <div id="register">
              {isFull ? (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 text-center font-bold">
                  Mohon Maaf, Kuota Event Penuh
                </div>
              ) : (
                <EventRegistrationForm eventId={event.id} eventName={event.name} session={session} />
              )}
            </div>

          </div>
        </div>

      </main>
    </div>
  )
}
