'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function DateTimeWidget() {
  // Hydration-safe: jangan render waktu di server. State awal null →
  // render placeholder, lalu set waktu nyata di useEffect (client-only).
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeZoneName = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
        .formatToParts(new Date())
        .find((p) => p.type === 'timeZoneName')?.value ?? '',
    []
  )

  return (
    <div className="flex flex-col items-end gap-0.5">
      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {now ? format(now, 'EEEE, dd MMMM yyyy', { locale: id }) : '\u00A0'}
      </p>
      <p className="flex items-baseline gap-1.5 text-3xl font-black text-primary tabular-nums leading-tight">
        {now ? (
          format(now, 'HH:mm:ss')
        ) : (
          <span className="text-muted-foreground">--:--:--</span>
        )}
        <span className="text-[11px] font-bold uppercase text-muted-foreground">{timeZoneName}</span>
      </p>
    </div>
  )
}
