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
import { ChevronLeft, ChevronRight, Clock, Users, X, Calendar as CalendarIcon, MapPin, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type CalendarItem = {
  id: string
  type: 'Rapat' | 'Proker' | 'Event'
  title: string
  startTime: string
  endTime?: string
  divisionId: string | null
  divisionName: string
  link: string
}

type DivisionOption = { id: string; name: string; slug: string }

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const TYPE_BADGE: Record<CalendarItem['type'], string> = {
  Rapat: 'bg-pastel-blue text-pastel-blue-foreground border border-border',
  Proker: 'bg-pastel-yellow text-pastel-yellow-foreground border border-border',
  Event: 'bg-pastel-green text-pastel-green-foreground border border-border',
}

const TYPE_BADGE_PILL: Record<CalendarItem['type'], string> = {
  Rapat: 'bg-pastel-blue/20 text-pastel-blue-foreground',
  Proker: 'bg-pastel-yellow/20 text-pastel-yellow-foreground',
  Event: 'bg-pastel-green/20 text-pastel-green-foreground',
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)

  const filtered = useMemo(
    () => {
      if (divisionFilter === 'SEMUA') return items
      if (divisionFilter === 'UMUM') return items.filter((i) => i.divisionId === null)
      return items.filter((i) => i.divisionId === divisionFilter)
    },
    [items, divisionFilter]
  )

  const days = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Minggu start (sesuai referensi)
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
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

  const now = new Date()

  const sortedUpcomingItems = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [filtered])

  const agendaItems = useMemo(() => {
    if (!selectedDay) return sortedUpcomingItems
    return sortedUpcomingItems.filter((i) => format(new Date(i.startTime), 'yyyy-MM-dd') === selectedDay)
  }, [sortedUpcomingItems, selectedDay])

  const selectedDayLabel = selectedDay
    ? format(new Date(`${selectedDay}T00:00:00`), 'EEEE, dd MMMM yyyy', { locale: id })
    : null

  const formatTimeRange = (item: CalendarItem) => {
    const start = new Date(item.startTime)
    const startLabel = format(start, 'HH:mm')
    if (!item.endTime) return startLabel
    const end = new Date(item.endTime)
    if (format(start, 'yyyy-MM-dd') !== format(end, 'yyyy-MM-dd')) {
      return `${startLabel} • ${format(end, 'dd MMM HH:mm', { locale: id })}`
    }
    return `${startLabel} - ${format(end, 'HH:mm')}`
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Calendar Section */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary capitalize">
            {format(month, 'MMMM yyyy', { locale: id })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMonth((m) => subMonths(m, 1))}
              className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted hover:border-primary transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-muted hover:border-primary transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <button
            onClick={() => setDivisionFilter('SEMUA')}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold min-h-[40px] flex items-center justify-center transition-colors ${
              divisionFilter === 'SEMUA'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setDivisionFilter('UMUM')}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold min-h-[40px] flex items-center justify-center transition-colors ${
              divisionFilter === 'UMUM'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            Umum / Akademik
          </button>
          {divisions.map((d) => (
            <button
              key={d.id}
              onClick={() => setDivisionFilter(d.id)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold min-h-[40px] flex items-center justify-center transition-colors ${
                divisionFilter === d.id
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map((dayName) => (
            <div key={dayName} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const dayItems = itemsByDay.get(dayKey) ?? []
            const inMonth = isSameMonth(day, month)
            const isToday = isSameDay(day, now)
            const isSelected = selectedDay === dayKey
            const hasEvents = dayItems.length > 0

            return (
              <div
                key={dayKey + idx}
                onClick={() => inMonth && setSelectedDay(isSelected ? null : dayKey)}
                className={`aspect-square p-2 border rounded-md transition-colors flex flex-col items-center justify-center relative cursor-pointer ${
                  !inMonth
                    ? 'border-transparent opacity-30'
                    : isSelected
                      ? 'border-primary bg-primary/10'
                      : isToday
                        ? 'border-primary'
                        : 'border-border hover:border-primary'
                }`}
              >
                <span className={`text-sm ${isSelected || isToday ? 'font-bold text-primary' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </span>
                {hasEvents && (
                  <span className="w-1.5 h-1.5 bg-primary rounded-full absolute bottom-2 shadow-[0_0_4px_rgba(30,58,138,0.5)]"></span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Agenda Section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
          <h3 className="text-xl font-bold text-primary">{selectedDayLabel ?? 'Agenda HIMASTA'}</h3>
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Semua agenda
            </button>
          )}
        </div>
        <div className="flex flex-col border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          {agendaItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Tidak ada agenda di kategori ini.
            </div>
          ) : (
            agendaItems.map((item) => {
              const dateObj = new Date(item.startTime)
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-border last:border-b-0 min-h-[72px] hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto mb-3 md:mb-0">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center flex-shrink-0 border border-primary/20">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {format(dateObj, 'MMM', { locale: id })}
                      </span>
                      <span className="text-xl font-black text-primary leading-none">
                        {format(dateObj, 'd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-semibold text-foreground text-base truncate">{item.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeRange(item)}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Users className="w-3.5 h-3.5" />
                          {item.divisionName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="md:ml-auto w-full md:w-auto flex justify-end gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 text-xs ${TYPE_BADGE_PILL[item.type]}`}>
                      {item.type === 'Rapat' && <CalendarIcon className="w-3.5 h-3.5" />}
                      {item.type === 'Proker' && <MapPin className="w-3.5 h-3.5" />}
                      {item.type === 'Event' && <Video className="w-3.5 h-3.5" />}
                      {item.type}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </section>

      {/* Detail Jadwal Popup Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl border border-border shadow-xl max-w-sm w-full overflow-hidden flex flex-col transform transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Detail Agenda</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Body */}
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-primary leading-tight">{selectedItem.title}</h4>
                <div className="flex items-center">
                  <Badge className={`${TYPE_BADGE[selectedItem.type]} px-2.5 py-0.5 text-xs font-semibold`}>
                    {selectedItem.type}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-3.5 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-0.5">Waktu Pelaksanaan</span>
                  <span className="font-semibold text-foreground">
                    {format(new Date(selectedItem.startTime), 'EEEE, dd MMMM yyyy - HH:mm', { locale: id })}
                    {selectedItem.endTime && <> - {format(new Date(selectedItem.endTime), 'HH:mm')}</>}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3.5 text-sm">
                <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground mb-0.5">Penyelenggara / Divisi</span>
                  <span className="font-semibold text-foreground">{selectedItem.divisionName}</span>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/30">
              <Button asChild size="default" className="rounded-full w-full font-semibold">
                <Link href={selectedItem.link} onClick={() => setSelectedItem(null)}>
                  Buka Menu Terkait
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
