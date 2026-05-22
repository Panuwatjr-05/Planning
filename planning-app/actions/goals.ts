'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

const CreateGoalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['short', 'long']).default('short'),
})

const UpdateGoalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  progress: z.number().min(0).max(100).optional(),
})

export async function createGoal(input: z.infer<typeof CreateGoalSchema>) {
  const parsed = CreateGoalSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('goals').insert({
    ...parsed.data,
    user_id: user.id,
  })
  if (error) throw error

  revalidatePath('/goals')
}

export async function updateGoal(input: z.infer<typeof UpdateGoalSchema>) {
  const parsed = UpdateGoalSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { id, ...updates } = parsed.data
  const isCompleting = updates.progress === 100

  const { error } = await supabase.from('goals').update({
    ...updates,
    ...(isCompleting && {
      is_completed: true,
      completed_at: new Date().toISOString(),
    }),
  }).eq('id', id)
  if (error) throw error

  revalidatePath('/goals')
}

export async function deleteGoal(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('goals').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/goals')
}
