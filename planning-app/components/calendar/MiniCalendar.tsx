'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, toLocalDateStr } from '@/lib/utils'

interface MiniCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  taskDates?: Set<string>
}

const DAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export function MiniCalendar({ selectedDate, onSelectDate, taskDates = new Set() }: MiniCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{MONTHS[viewMonth]} {viewYear}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-accent">
            <ChevronLeft size={14} />
          </button>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-accent">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground py-1 font-medium">
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />

          const date = new Date(viewYear, viewMonth, day)
          const dateStr = toLocalDateStr(date)
          const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day
          const isSelected = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day
          const hasTask = taskDates.has(dateStr)

          return (
            <button
              key={day}
              onClick={() => onSelectDate(date)}
              className={cn(
                'relative flex items-center justify-center text-xs h-7 w-7 mx-auto rounded-full transition-colors',
                isSelected && 'bg-primary text-primary-foreground',
                !isSelected && isToday && 'text-primary font-bold',
                !isSelected && !isToday && 'hover:bg-accent text-foreground',
              )}
            >
              {day}
              {hasTask && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
