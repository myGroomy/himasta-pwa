'use client'

import React, { useRef } from 'react'
import { Award, Download, X } from 'lucide-react'

interface CertificateData {
  certificateNumber: string
  recipientName: string
  eventName: string
  eventDate: string
  organizer: string
  issuedAt: string
}

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  data: CertificateData | null
}

export function CertificateModal({ isOpen, onClose, data }: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  if (!isOpen || !data) return null

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 1200
    canvas.height = 840

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bgGradient.addColorStop(0, '#0f172a')
    bgGradient.addColorStop(1, '#1e293b')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Gold/Navy Border
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 12
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

    ctx.strokeStyle = '#38bdf8'
    ctx.lineWidth = 3
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90)

    // Header
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('HIMPUNAN MAHASISWA STATISTIKA', canvas.width / 2, 120)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '20px sans-serif'
    ctx.fillText('SERTIFIKAT PENGHARGAAN & KEHADIRAN', canvas.width / 2, 160)

    ctx.fillStyle = '#64748b'
    ctx.font = '14px monospace'
    ctx.fillText(`No: ${data.certificateNumber}`, canvas.width / 2, 195)

    // Body
    ctx.fillStyle = '#f8fafc'
    ctx.font = '22px sans-serif'
    ctx.fillText('Diberikan kepada:', canvas.width / 2, 270)

    // Recipient Name
    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 44px sans-serif'
    ctx.fillText(data.recipientName.toUpperCase(), canvas.width / 2, 340)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = '20px sans-serif'
    ctx.fillText('Atas partisipasi dan kelulusan keikutsertaan sebagai Peserta pada kegiatan:', canvas.width / 2, 420)

    // Event Name
    ctx.fillStyle = '#f8fafc'
    ctx.font = 'bold 36px sans-serif'
    ctx.fillText(`"${data.eventName}"`, canvas.width / 2, 485)

    // Date & Organizer
    const formattedDate = new Date(data.eventDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    ctx.fillStyle = '#94a3b8'
    ctx.font = '18px sans-serif'
    ctx.fillText(`Diselenggarakan oleh ${data.organizer} pada tanggal ${formattedDate}`, canvas.width / 2, 545)

    // Footer Signatures Placeholder
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 150, 680)
    ctx.lineTo(canvas.width / 2 + 150, 680)
    ctx.stroke()

    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('Panitia Pelaksana HIMASTA', canvas.width / 2, 710)

    // Trigger Image Download
    const imageURI = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `Sertifikat-${data.eventName.replace(/\s+/g, '_')}-${data.recipientName.replace(/\s+/g, '_')}.png`
    link.href = imageURI
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formattedDate = new Date(data.eventDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {/* Hidden Canvas for High-Res Export */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 text-sky-400">
          <Award className="h-7 w-7" />
          <h3 className="text-xl font-bold text-white">Sertifikat Resmi Event</h3>
        </div>

        {/* Certificate Preview Card */}
        <div className="my-6 rounded-xl border border-sky-500/30 bg-slate-950 p-6 text-center shadow-inner">
          <p className="text-xs uppercase tracking-widest text-sky-400">Himpunan Mahasiswa Statistika</p>
          <h2 className="mt-1 text-lg font-bold text-slate-200">SERTIFIKAT KEHADIRAN</h2>
          <p className="mt-1 text-xs text-slate-500">{data.certificateNumber}</p>

          <div className="my-5 border-y border-slate-800 py-4">
            <p className="text-xs text-slate-400">Diberikan Kepada:</p>
            <p className="mt-1 text-2xl font-extrabold text-sky-400">{data.recipientName}</p>
            <p className="mt-3 text-xs text-slate-300">
              Sebagai Peserta dalam kegiatan <span className="font-semibold text-white">&ldquo;{data.eventName}&rdquo;</span>
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Penyelenggara: {data.organizer} • Tanggal: {formattedDate}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Tutup
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            <Download className="h-4 w-4" />
            Unduh Sertifikat (PNG)
          </button>
        </div>
      </div>
    </div>
  )
}
