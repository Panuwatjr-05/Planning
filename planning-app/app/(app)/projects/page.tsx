import { createServerClient } from '@/lib/supabase/server'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ProjectCard } from '@/components/projects/ProjectCard'

export default async function ProjectsPage() {
  const supabase = await createServerClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 page-enter">
      <div className="pb-2 border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight">โปรเจค</h1>
        <p className="text-sm text-muted-foreground mt-1">เก็บแนวคิดและรายละเอียดโปรเจคของคุณ</p>
      </div>

      <ProjectForm />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 220px))' }}>
        {(projects ?? []).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {(projects ?? []).length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">📁</p>
            <p className="text-sm">ยังไม่มีโปรเจค</p>
            <p className="text-xs mt-1 opacity-60">สร้างโปรเจคแรกได้เลย</p>
          </div>
        )}
      </div>
    </div>
  )
}
