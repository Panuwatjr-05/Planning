import { createServerClient } from '@/lib/supabase/server'
import { IdeaForm } from '@/components/ideas/IdeaForm'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { type Tables } from '@/types/database'

export default async function IdeasPage() {
  const supabase = await createServerClient()

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  const typedIdeas = (ideas ?? []) as Tables<'ideas'>[]

  return (
    <div className="space-y-8 page-enter">
      <div className="pb-2 border-b border-border">
        <h1 className="text-3xl font-bold tracking-tight">ไอเดีย</h1>
        <p className="text-sm text-muted-foreground mt-1">จดไอเดียก่อนลืม</p>
      </div>

      <IdeaForm />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 220px))' }}>
        {typedIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}

        {typedIdeas.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">💡</p>
            <p className="text-sm">ยังไม่มีไอเดีย</p>
            <p className="text-xs mt-1 opacity-60">จดไอเดียแรกได้เลย ก่อนที่มันจะหายไป</p>
          </div>
        )}
      </div>
    </div>
  )
}
