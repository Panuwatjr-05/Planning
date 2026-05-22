'use client'

import { useOptimistic, useTransition } from 'react'
import { updateTask, deleteTask } from '@/actions/tasks'
import { type Tables } from '@/types/database'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  work:   { bg: 'oklch(0.93 0.07 145)', text: 'oklch(0.28 0.1 145)' },
  life:   { bg: 'oklch(0.93 0.07 72)',  text: 'oklch(0.3 0.1 68)'   },
  urgent: { bg: 'oklch(0.93 0.07 22)',  text: 'oklch(0.28 0.14 22)' },
}

const TAG_ACCENT: Record<string, string> = {
  work:   'oklch(0.5 0.16 145)',
  life:   'oklch(0.62 0.14 68)',
  urgent: 'oklch(0.52 0.18 22)',
}

const TAG_LABEL: Record<string, string> = {
  work: 'ปกติ', life: 'ปานกลาง', urgent: 'ด่วน',
}

interface TaskItemProps {
  task: Tables<'tasks'>
}

export function TaskItem({ task }: TaskItemProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticDone, setOptimisticDone] = useOptimistic(task.is_done)
  const [optimisticDeleted, setOptimisticDeleted] = useOptimistic(false)

  function handleToggle() {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone)
      await updateTask({ id: task.id, is_done: !task.is_done })
    })
  }

  function handleDelete() {
    startTransition(async () => {
      setOptimisticDeleted(true)
      await deleteTask(task.id)
    })
  }

  if (optimisticDeleted) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border group">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="w-5 h-5 rounded-full border-2 shrink-0 transition-all flex items-center justify-center"
        style={optimisticDone
          ? { background: TAG_ACCENT[task.tag], borderColor: TAG_ACCENT[task.tag] }
          : { borderColor: 'oklch(0.7 0.005 260)' }
        }
      >
        {optimisticDone && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <span className={cn(
        'flex-1 text-sm transition-all',
        optimisticDone && 'line-through text-muted-foreground'
      )}>
        {task.title}
      </span>

      <span
        className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
        style={{ background: TAG_COLORS[task.tag].bg, color: TAG_COLORS[task.tag].text }}
      >
        {TAG_LABEL[task.tag]}
      </span>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
