import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectEditor } from '@/components/projects/ProjectEditor'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { createSubtask, updateSubtask, deleteSubtask } from '@/actions/subtasks'
import { type Tables } from '@/types/database'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: project, error }, { data: subtasks }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('subtasks').select('*').eq('project_id', id).order('order_index', { ascending: true }),
  ])

  if (error || !project || !('id' in project)) notFound()

  async function onCreate(title: string, status: 'todo' | 'doing' | 'done', order_index: number) {
    'use server'
    await createSubtask({ project_id: id, title, status, order_index })
  }
  async function onUpdateStatus(itemId: string, status: 'todo' | 'doing' | 'done') {
    'use server'
    await updateSubtask({ id: itemId, status })
  }
  async function onDelete(itemId: string) {
    'use server'
    await deleteSubtask(itemId, id)
  }

  const items = (subtasks ?? [] as Tables<'subtasks'>[]).map((s) => ({
    id: s.id, title: s.title, status: s.status, order_index: s.order_index, created_at: s.created_at,
  }))

  return (
    <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 items-start">
      <ProjectEditor project={project} />
      <div className="mt-14 bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          <p className="text-xs font-semibold text-muted-foreground tracking-wide">บอร์ดงาน</p>
        </div>
        <div className="p-4">
          <KanbanBoard initialItems={items} onCreate={onCreate} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
        </div>
      </div>
    </div>
  )
}
