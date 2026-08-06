'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function DateTimeWidget() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
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
        {format(now, 'EEEE, dd MMMM yyyy', { locale: id })}
      </p>
      <p className="flex items-baseline gap-1.5 text-3xl font-black text-primary tabular-nums leading-tight">
        {format(now, 'HH:mm:ss')}
        <span className="text-[11px] font-bold uppercase text-muted-foreground">{timeZoneName}</span>
      </p>
    </div>
  )
}
