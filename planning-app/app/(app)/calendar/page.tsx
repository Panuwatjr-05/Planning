import { createServerClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendar/CalendarView'
import { type Tables } from '@/types/database'

export default async function CalendarPage() {
  const supabase = await createServerClient()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="pb-2 border-b border-border shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">ปฏิทิน</h1>
      </div>
      <CalendarView tasks={(tasks ?? []) as Tables<'tasks'>[]} />
    </div>
  )
}
