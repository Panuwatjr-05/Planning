'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { createTask } from '@/actions/tasks'
import { type Tables } from '@/types/database'
import { TaskItem } from './TaskItem'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { cn } from '@/lib/utils'
import { CalendarClock, X } from 'lucide-react'

const TAGS = [
  { value: 'work',   label: 'ปกติ'    },
  { value: 'life',   label: 'ปานกลาง' },
  { value: 'urgent', label: 'ด่วน'    },
] as const

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  work:   { bg: 'oklch(0.93 0.07 145)', text: 'oklch(0.28 0.1 145)' },
  life:   { bg: 'oklch(0.93 0.07 72)',  text: 'oklch(0.3 0.1 68)'   },
  urgent: { bg: 'oklch(0.93 0.07 22)',  text: 'oklch(0.28 0.14 22)' },
}

const SECTIONS = [
  { tag: 'urgent', label: 'ด่วน' },
  { tag: 'life',   label: 'ปานกลาง' },
  { tag: 'work',   label: 'ปกติ' },
] as const

const TAG_ACCENT: Record<string, string> = {
  urgent: 'oklch(0.52 0.18 22)',
  life:   'oklch(0.62 0.14 68)',
  work:   'oklch(0.5 0.16 145)',
}

type Tag = 'work' | 'life' | 'urgent'

interface TaskBoardProps {
  initialTasks: Tables<'tasks'>[]
  date: string
}

export function TaskBoard({ initialTasks, date }: TaskBoardProps) {
  const [isPending, startTransition] = useTransition()
  const [tasks, addOptimisticTask] = useOptimistic(
    initialTasks,
    (state, newTask: Tables<'tasks'>) => [...state, newTask]
  )
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [scheduledDate, setScheduledDate] = useState(date)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedTag, setSelectedTag] = useState<Tag>('work')

  const done = tasks.filter((t) => t.is_done).length

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim()
    const tag = selectedTag
    if (!title) return

    const taskDate = showAdvanced && scheduledDate ? scheduledDate : date
    const taskStart = showAdvanced && startTime ? startTime : null
    const taskEnd = showAdvanced && endTime ? endTime : null

    const optimisticTask: Tables<'tasks'> = {
      id: crypto.randomUUID(),
      user_id: '',
      title,
      tag,
      is_done: false,
      date: taskDate,
      start_time: taskStart,
      end_time: taskEnd,
      project_id: null,
      created_at: new Date().toISOString(),
    }

    startTransition(async () => {
      addOptimisticTask(optimisticTask)
      await createTask({ title, tag, date: taskDate, start_time: taskStart, end_time: taskEnd })
      form.reset()
      ;(form.elements.namedItem('title') as HTMLInputElement).focus()
      if (showAdvanced) {
        setStartTime('')
        setEndTime('')
      }
    })
  }

  function toggleAdvanced() {
    setShowAdvanced((v) => {
      if (!v) setScheduledDate(date)
      return !v
    })
    setStartTime('')
    setEndTime('')
  }

  return (
    <div className="space-y-6">
      {/* Quick capture form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            name="title"
            autoFocus
            placeholder="เพิ่มงานใหม่..."
            disabled={isPending}
            className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/40 transition-colors"
          />
          <button
            type="button"
            onClick={toggleAdvanced}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-medium transition-colors',
              showAdvanced
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-accent'
            )}
          >
            {showAdvanced ? <X size={13} /> : <CalendarClock size={13} />}
            ล่วงหน้า
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold disabled:opacity-30 hover:opacity-85 transition-opacity"
          >
            เพิ่ม
          </button>
        </div>

        {/* Advanced scheduler */}
        {showAdvanced && (
          <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-dashed">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">วันที่</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">เริ่ม</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">สิ้นสุด</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {scheduledDate !== date && (
              <div className="flex items-end pb-1.5">
                <span className="text-xs text-primary font-medium">
                  📅 {new Date(scheduledDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {TAGS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedTag(t.value)}
              className="px-3 py-1 rounded-full text-xs border font-medium transition-all"
              style={
                selectedTag === t.value
                  ? { background: TAG_COLORS[t.value].bg, color: TAG_COLORS[t.value].text, borderColor: 'transparent' }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {/* Progress */}
      <ProgressBar value={done} total={tasks.length} />

      {/* Task columns — kanban 3 col */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        {SECTIONS.map(({ tag, label }) => {
          const grouped = tasks.filter((t) => t.tag === tag)
          return (
            <div key={tag} className="space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TAG_ACCENT[tag] }} />
                  <h3 className="text-xs font-semibold text-foreground">{label}</h3>
                </div>
                <span className="text-xs text-muted-foreground/60 tabular-nums">{grouped.length}</span>
              </div>
              {grouped.length === 0 ? (
                <p className="text-xs text-muted-foreground/40 py-4 text-center">ไม่มีงาน</p>
              ) : (
                grouped.map((task) => <TaskItem key={task.id} task={task} />)
              )}
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          ยังไม่มีงานวันนี้ เพิ่มงานด้านบนได้เลย
        </p>
      )}
    </div>
  )
}
