'use client'

import { useState, useTransition } from 'react'
import { updateTask, deleteTask } from '@/actions/tasks'
import { type Tables } from '@/types/database'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Trash2, Clock, CalendarDays, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TAG_LABEL: Record<string, string> = {
  work: 'ปกติ', life: 'ปานกลาง', urgent: 'ด่วน',
}
const TAG_COLOR: Record<string, string> = {
  work:   'oklch(0.6 0.15 145)',
  life:   'oklch(0.72 0.14 70)',
  urgent: 'oklch(0.58 0.2 25)',
}

interface TaskDetailSheetProps {
  task: Tables<'tasks'> | null
  onClose: () => void
}

export function TaskDetailSheet({ task, onClose }: TaskDetailSheetProps) {
  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-80 p-0 overflow-hidden flex flex-col">
        {task && <TaskDetailContent key={task.id} task={task} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function TaskDetailContent({ task, onClose }: { task: Tables<'tasks'>; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState(task.title)
  const [startTime, setStartTime] = useState(task.start_time?.slice(0, 5) ?? '')
  const [endTime, setEndTime] = useState(task.end_time?.slice(0, 5) ?? '')

  function handleSave() {
    startTransition(async () => {
      await updateTask({
        id: task.id,
        title: title.trim() || task.title,
        start_time: startTime || null,
        end_time: endTime || null,
      })
      onClose()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTask(task.id)
      onClose()
    })
  }

  function handleToggle() {
    startTransition(async () => {
      await updateTask({ id: task.id, is_done: !task.is_done })
      onClose()
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ background: TAG_COLOR[task.tag] }}
          />
          <span className="text-xs text-muted-foreground">{TAG_LABEL[task.tag]}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium">ชื่องาน</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:border-foreground/30 transition-colors"
          />
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <CalendarDays size={11} />
            วันที่
          </label>
          <p className="text-sm px-3 py-2 border border-border rounded-lg bg-muted/30 text-foreground">
            {new Date(task.date).toLocaleDateString('th-TH', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* Time */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5">
            <Clock size={11} />
            เวลา
          </label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:border-foreground/30 transition-colors"
            />
            <span className="text-muted-foreground text-xs">–</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-transparent focus:outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
        </div>

        {/* Status toggle */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors',
            task.is_done
              ? 'border-border bg-muted/40 text-foreground'
              : 'border-dashed border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
          )}
        >
          {task.is_done
            ? <CheckCircle2 size={16} className="shrink-0" />
            : <Circle size={16} className="shrink-0" />
          }
          <span className="text-sm">
            {task.is_done ? 'เสร็จแล้ว' : 'ยังไม่เสร็จ'}
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-border flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 py-2 bg-foreground text-background rounded-lg text-sm font-medium disabled:opacity-30 hover:opacity-90 transition-opacity"
        >
          บันทึก
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-2 border border-border rounded-lg text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
