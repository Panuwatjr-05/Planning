'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

const CreateSchema = z.object({
  idea_id: z.uuid(),
  title: z.string().min(1),
  status: z.enum(['todo', 'doing', 'done']).default('todo'),
  order_index: z.number().default(0),
})

const UpdateSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  order_index: z.number().optional(),
})

export async function createIdeaTask(input: z.infer<typeof CreateSchema>) {
  const parsed = CreateSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('idea_tasks').insert({ ...parsed.data, user_id: user.id })
  if (error) throw error

  revalidatePath(`/ideas/${input.idea_id}`)
}

export async function updateIdeaTask(input: z.infer<typeof UpdateSchema>) {
  const parsed = UpdateSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { id, ...updates } = parsed.data
  const { error } = await supabase.from('idea_tasks').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteIdeaTask(id: string, ideaId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('idea_tasks').delete().eq('id', id)
  if (error) throw error

  revalidatePath(`/ideas/${ideaId}`)
}
