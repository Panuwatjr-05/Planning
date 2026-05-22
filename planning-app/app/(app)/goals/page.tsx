import { createServerClient } from '@/lib/supabase/server'
import { OverviewGrid } from '@/components/goals/OverviewGrid'
import { updateTask } from '@/actions/tasks'
import { toggleCompleteProject } from '@/actions/projects'
import { togglePinIdea } from '@/actions/ideas'

export default async function GoalsPage() {
  const supabase = await createServerClient()

  const [{ data: tasks }, { data: projects }, { data: ideas }] = await Promise.all([
    supabase.from('tasks').select('id, title, is_done').order('created_at', { ascending: false }).limit(80),
    supabase.from('projects').select('id, title, is_completed').order('created_at', { ascending: false }),
    supabase.from('ideas').select('id, title, is_pinned').order('created_at', { ascending: false }),
  ])

  const taskItems    = (tasks    ?? []).map((t) => ({ id: t.id, title: t.title, isActive: t.is_done }))
  const projectItems = (projects ?? []).map((p) => ({ id: p.id, title: p.title, isActive: p.is_completed ?? false }))
  const ideaItems    = (ideas    ?? []).map((i) => ({ id: i.id, title: i.title, isActive: i.is_pinned }))

  const taskDone    = taskItems.filter((t) => t.isActive).length
  const projectDone = projectItems.filter((p) => p.isActive).length
  const ideaPinned  = ideaItems.filter((i) => i.isActive).length

  async function toggleTask(id: string, current: boolean) {
    'use server'
    await updateTask({ id, is_done: !current })
  }

  async function toggleProject(id: string, current: boolean) {
    'use server'
    await toggleCompleteProject(id, !current)
  }

  async function toggleIdea(id: string, current: boolean) {
    'use server'
    await togglePinIdea(id, !current)
  }

  return (
    <div className="space-y-8 page-enter">
      <div className="pb-2 border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight">ภาพรวม</h1>
        <p className="text-sm text-muted-foreground mt-1">ดูความคืบหน้าของทุกอย่างในที่เดียว</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="งาน" done={taskDone} total={taskItems.length} accent="oklch(0.55 0.14 260)" />
        <StatCard label="โปรเจค" done={projectDone} total={projectItems.length} accent="oklch(0.55 0.14 290)" />
        <StatCard label="ไอเดีย" done={ideaPinned} total={ideaItems.length} accent="oklch(0.72 0.14 80)" />
      </div>

      {/* Grids */}
      <div className="space-y-8">
        <GridSection label="งาน" done={taskDone} total={taskItems.length} accent="oklch(0.55 0.14 260)">
          <OverviewGrid items={taskItems} accent="oklch(0.55 0.14 260)" onToggle={toggleTask} />
        </GridSection>

        <GridSection label="โปรเจค" done={projectDone} total={projectItems.length} accent="oklch(0.55 0.14 290)">
          <OverviewGrid items={projectItems} accent="oklch(0.55 0.14 290)" onToggle={toggleProject} />
        </GridSection>

        <GridSection label="ไอเดีย" done={ideaPinned} total={ideaItems.length} accent="oklch(0.72 0.14 80)">
          <OverviewGrid items={ideaItems} accent="oklch(0.72 0.14 80)" onToggle={toggleIdea} />
        </GridSection>
      </div>
    </div>
  )
}

function StatCard({ label, done, total, accent }: { label: string; done: number; total: number; accent: string }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{done}/{total}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, background: accent }} />
      </div>
      <p className="text-2xl font-bold">{percent}<span className="text-sm font-normal text-muted-foreground">%</span></p>
    </div>
  )
}

function GridSection({
  label, done, total, accent, children,
}: {
  label: string; done: number; total: number; accent: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="text-xs text-muted-foreground ml-auto">{done}/{total} สำเร็จ</span>
      </div>
      <div className="border rounded-2xl p-4 min-h-[60px]">
        {children}
      </div>
    </div>
  )
}
