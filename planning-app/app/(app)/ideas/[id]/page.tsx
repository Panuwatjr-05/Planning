import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { IdeaEditor } from '@/components/ideas/IdeaEditor'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { createIdeaTask, updateIdeaTask, deleteIdeaTask } from '@/actions/idea_tasks'
import { type Tables } from '@/types/database'

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: idea, error }, { data: ideaTasks }] = await Promise.all([
    supabase.from('ideas').select('*').eq('id', id).single(),
    supabase.from('idea_tasks').select('*').eq('idea_id', id).order('order_index', { ascending: true }),
  ])

  if (error || !idea || !('id' in idea)) notFound()

  async function onCreate(title: string, status: 'todo' | 'doing' | 'done', order_index: number) {
    'use server'
    await createIdeaTask({ idea_id: id, title, status, order_index })
  }
  async function onUpdateStatus(itemId: string, status: 'todo' | 'doing' | 'done') {
    'use server'
    await updateIdeaTask({ id: itemId, status })
  }
  async function onDelete(itemId: string) {
    'use server'
    await deleteIdeaTask(itemId, id)
  }

  const items = (ideaTasks ?? [] as Tables<'idea_tasks'>[]).map((t) => ({
    id: t.id, title: t.title, status: t.status, order_index: t.order_index, created_at: t.created_at,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 items-start">
      <IdeaEditor idea={idea} />
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
