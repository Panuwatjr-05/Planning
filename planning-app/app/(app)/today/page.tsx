import { createServerClient } from '@/lib/supabase/server'
import { TaskBoard } from '@/components/tasks/TaskBoard'
import { type Tables } from '@/types/database'
import { toLocalDateStr } from '@/lib/utils'

function getTodayDate() {
  return toLocalDateStr(new Date())
}

function formatThaiDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default async function TodayPage() {
  const supabase = await createServerClient()
  const today = getTodayDate()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('date', today)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-8 page-enter">
      <div className="pb-2 border-b border-border">
        <p className="text-xs text-muted-foreground mb-1">{formatThaiDate(today)}</p>
        <h1 className="text-3xl font-bold tracking-tight">งานวันนี้</h1>
      </div>

      <TaskBoard initialTasks={(tasks ?? []) as Tables<'tasks'>[]} date={today} />
    </div>
  )
}
