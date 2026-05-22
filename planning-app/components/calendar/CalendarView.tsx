'use client'

import { useState, useCallback, useMemo, useRef, useTransition } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventDropArg, DateSelectArg } from '@fullcalendar/core'
import { updateTask, createTask } from '@/actions/tasks'
import { type Tables } from '@/types/database'
import { TaskDetailSheet } from './TaskDetailSheet'
import { MiniCalendar } from './MiniCalendar'
import '@/app/calendar.css'
import { cn, toLocalDateStr } from '@/lib/utils'
import { X } from 'lucide-react'

const TAG_BG: Record<string, string> = {
  work:   'oklch(0.93 0.07 145)',
  life:   'oklch(0.93 0.07 72)',
  urgent: 'oklch(0.93 0.07 22)',
}
const TAG_ACCENT: Record<string, string> = {
  work:   'oklch(0.48 0.17 145)',
  life:   'oklch(0.58 0.16 68)',
  urgent: 'oklch(0.48 0.21 22)',
}
const TAG_TEXT: Record<string, string> = {
  work:   'oklch(0.28 0.1 145)',
  life:   'oklch(0.3 0.1 68)',
  urgent: 'oklch(0.28 0.14 22)',
}
const TAG_COLOR = TAG_ACCENT
const TAG_LABEL: Record<string, string> = {
  work: 'ปกติ', life: 'ปานกลาง', urgent: 'ด่วน',
}

interface CalendarViewProps {
  tasks: Tables<'tasks'>[]
}

interface PendingSelect {
  info: DateSelectArg
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [selectedTask, setSelectedTask] = useState<Tables<'tasks'> | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [pendingSelect, setPendingSelect] = useState<PendingSelect | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newTag, setNewTag] = useState<'work' | 'life' | 'urgent'>('work')
  const [isCreating, startCreate] = useTransition()
  const titleInputRef = useRef<HTMLInputElement>(null)

  const taskDates = useMemo(
    () => new Set(tasks.map((t) => t.date)),
    [tasks]
  )

  const todayTasks = useMemo(() => {
    const dateStr = toLocalDateStr(selectedDate)
    return tasks
      .filter((t) => t.date === dateStr)
      .sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  }, [tasks, selectedDate])

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.start_time ? `${task.date}T${task.start_time}` : task.date,
    end: task.end_time ? `${task.date}T${task.end_time}` : undefined,
    allDay: !task.start_time,
    backgroundColor: TAG_BG[task.tag],
    borderColor: TAG_ACCENT[task.tag],
    textColor: TAG_TEXT[task.tag],
    classNames: task.is_done ? ['opacity-40'] : [],
  }))

  const handleEventClick = useCallback((info: EventClickArg) => {
    const task = tasks.find((t) => t.id === info.event.id)
    if (task) setSelectedTask(task)
  }, [tasks])

  const handleEventDrop = useCallback(async (info: EventDropArg) => {
    const { event } = info
    const newDate = event.startStr.split('T')[0]
    const newStartTime = event.start && !event.allDay ? event.start.toTimeString().slice(0, 5) : null
    const newEndTime = event.end && !event.allDay ? event.end.toTimeString().slice(0, 5) : null
    await updateTask({ id: event.id, date: newDate, start_time: newStartTime, end_time: newEndTime })
  }, [])

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setPendingSelect({ info })
    setNewTitle('')
    setNewTag('work')
    setTimeout(() => titleInputRef.current?.focus(), 50)
  }, [])

  function handleQuickAddSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!pendingSelect || !newTitle.trim()) return
    const { info } = pendingSelect
    const date = info.startStr.split('T')[0]
    const startTime = info.allDay ? null : info.startStr.split('T')[1]?.slice(0, 5) ?? null
    const endTime = info.allDay ? null : info.endStr?.split('T')[1]?.slice(0, 5) ?? null
    startCreate(async () => {
      await createTask({ title: newTitle.trim(), tag: newTag, date, start_time: startTime, end_time: endTime })
      setPendingSelect(null)
    })
  }

  const handleMiniCalendarSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  return (
    <>
      <div className="flex gap-4 h-[calc(100vh-120px)]">

        {/* Left sidebar */}
        <div className="w-52 shrink-0 flex flex-col gap-5">
          <MiniCalendar
            selectedDate={selectedDate}
            onSelectDate={handleMiniCalendarSelect}
            taskDates={taskDates}
          />

          {/* Tag legend */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium mb-2">ประเภท</p>
            {Object.entries(TAG_LABEL).map(([tag, label]) => (
              <div key={tag} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: TAG_COLOR[tag] }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Tasks on selected day */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </p>
            <div className="space-y-0.5 overflow-y-auto flex-1 pr-1">
              {todayTasks.length === 0 && (
                <p className="text-xs text-muted-foreground/60">ไม่มีงาน</p>
              )}
              {todayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="w-full text-left flex items-start gap-2 py-1.5 px-2 rounded-md hover:bg-accent transition-colors group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: TAG_COLOR[task.tag] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs truncate', task.is_done && 'line-through text-muted-foreground/50')}>
                      {task.title}
                    </p>
                    {task.start_time && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {task.start_time.slice(0, 5)}{task.end_time ? ` – ${task.end_time.slice(0, 5)}` : ''}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-border shrink-0" />

        {/* Main calendar */}
        <div className="flex-1 min-w-0 relative">
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={selectedDate}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            locale="th"
            firstDay={1}
            height="100%"
            events={events}
            editable
            selectable
            selectMirror
            dayMaxEvents
            nowIndicator
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            select={handleDateSelect}
            buttonText={{
              today: 'วันนี้',
              month: 'เดือน',
              week: 'สัปดาห์',
              day: 'วัน',
            }}
            datesSet={(info) => setSelectedDate(new Date(info.view.currentStart))}
          />

          {/* Inline quick-add overlay */}
          {pendingSelect && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <form
                onSubmit={handleQuickAddSubmit}
                className="bg-card border border-border rounded-xl shadow-lg w-72 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">เพิ่มงาน</span>
                  <button
                    type="button"
                    onClick={() => setPendingSelect(null)}
                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <input
                  ref={titleInputRef}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ชื่องาน..."
                  className="w-full text-sm bg-transparent border border-border rounded-lg px-3 py-2 outline-none focus:border-foreground/30 transition-colors placeholder:text-muted-foreground/40"
                  onKeyDown={(e) => e.key === 'Escape' && setPendingSelect(null)}
                />

                <div className="flex gap-1.5">
                  {(['work', 'life', 'urgent'] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewTag(tag)}
                      className={cn(
                        'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                        newTag === tag ? 'text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                      )}
                      style={newTag === tag ? { background: TAG_COLOR[tag] } : undefined}
                    >
                      {TAG_LABEL[tag]}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newTitle.trim() || isCreating}
                  className="w-full py-2 bg-foreground text-background rounded-lg text-sm font-medium disabled:opacity-30 hover:opacity-90 transition-opacity"
                >
                  {isCreating ? 'กำลังบันทึก...' : 'เพิ่ม'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  )
}
