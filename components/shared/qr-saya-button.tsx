'use client'

import { useState } from 'react'
import { QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MyQrDialog } from '@/components/shared/my-qr-dialog'

export function QrSayaButton({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}>
        <QrCode className="h-4 w-4" />
        {children ?? 'QR Saya'}
      </Button>
      <MyQrDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
