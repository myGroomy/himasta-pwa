'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CalendarItem = {
  id: string
  type: 'Rapat' | 'Proker' | 'Event'
  title: string
  startTime: string
  divisionId: string | null
  divisionName: string
  link: string
}

type DivisionOption = { id: string; name: string; slug: string }

const TYPE_BADGE: Record<CalendarItem['type'], string> = {
  Rapat: 'bg-pastel-blue text-pastel-blue-foreground border border-border',
  Proker: 'bg-pastel-yellow text-pastel-yellow-foreground border border-border',
  Event: 'bg-pastel-green text-pastel-green-foreground border border-border',
}

export function NotionCalendarView({
  divisions,
  items,
}: {
  divisions: DivisionOption[]
  items: CalendarItem[]
}) {
  const [month, setMonth] = useState(() => new Date())
  const [divisionFilter, setDivisionFilter] = useState<string>('SEMUA')

  const filtered = useMemo(
    () =>
      divisionFilter === 'SEMUA'
        ? items
        : items.filter((i) => i.divisionId === divisionFilter),
    [items, divisionFilter]
  )

  const days = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [month])

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    for (const item of filtered) {
      const key = format(new Date(item.startTime), 'yyyy-MM-dd')
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return map
  }, [filtered])

  // Group items by month for Kanban view
  const itemsByMonth = useMemo(() => {
    const map = new Map<string, CalendarItem[]>()
    // Urutkan item dari yang paling baru
    const sorted = [...filtered].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    
    for (const item of sorted) {
      const date = new Date(item.startTime)
      const key = format(date, 'MMMM yyyy', { locale: id })
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return map
  }, [filtered])

  const now = new Date()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={divisionFilter} onValueChange={setDivisionFilter}>
          <SelectTrigger className="w-48 bg-background border-border">
            <SelectValue placeholder="Semua divisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEMUA">Semua divisi</SelectItem>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-pastel-blue text-pastel-blue-foreground border border-border">Rapat</Badge>
          <Badge className="bg-pastel-yellow text-pastel-yellow-foreground border border-border">Proker</Badge>
          <Badge className="bg-pastel-green text-pastel-green-foreground border border-border">Event</Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Kiri: Kalender Utama */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="border-border" onClick={() => setMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-border" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold capitalize ml-2">{format(month, 'MMMM yyyy', { locale: id })}</h2>
          </div>

          <div className="rounded-xl border border-border bg-background overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dayKey = format(day, 'yyyy-MM-dd')
                const dayItems = itemsByDay.get(dayKey) ?? []
                const inMonth = isSameMonth(day, month)
                const isToday = isSameDay(day, now)
                
                return (
                  <div
                    key={dayKey}
                    className={`min-h-[120px] border-b border-r border-border p-2 last:border-r-0 hover:bg-secondary/20 transition-colors ${
                      inMonth ? 'bg-background' : 'bg-secondary/40'
                    }`}
                  >
                    <div
                      className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium ${
                        isToday ? 'bg-foreground text-background' : 'text-muted-foreground'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1.5">
                      {dayItems.slice(0, 4).map((item) => (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="block truncate rounded-md px-1.5 py-1 text-xs leading-tight hover:opacity-80 transition-opacity"
                        >
                          <Badge className={`mr-1 px-1 py-0 ${TYPE_BADGE[item.type]}`}>{item.type}</Badge>
                          <span className="text-foreground font-medium">{item.title}</span>
                        </Link>
                      ))}
                      {dayItems.length > 4 && (
                        <p className="px-1.5 text-xs text-muted-foreground font-medium">
                          +{dayItems.length - 4} lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Kanan: List Kegiatan per Bulan */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <h3 className="font-semibold text-foreground">Agenda Terjadwal</h3>
          <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
            {Array.from(itemsByMonth.keys()).length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada jadwal.</p>
            ) : (
              Array.from(itemsByMonth.keys()).map((monthKey) => {
                const monthItems = itemsByMonth.get(monthKey) ?? []
                return (
                  <div key={monthKey}>
                    <h4 className="mb-3 text-sm font-semibold text-muted-foreground capitalize">{monthKey}</h4>
                    <div className="space-y-2">
                      {monthItems.map((item) => (
                        <Link key={item.id} href={item.link} className="block group">
                          <div className="rounded-lg border border-border bg-background p-3 shadow-sm transition-all hover:border-foreground/20 hover:shadow-md">
                            <div className="mb-1.5 flex items-center justify-between">
                              <Badge className={`${TYPE_BADGE[item.type]} px-1.5 py-0 text-[10px]`}>{item.type}</Badge>
                              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {format(new Date(item.startTime), 'dd MMM', { locale: id })}
                              </span>
                            </div>
                            <p className="font-medium text-foreground text-sm line-clamp-1">{item.title}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
