'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tag: z.enum(['work', 'life', 'urgent']).default('work'),
  date: z.string(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  project_id: z.uuid().nullable().optional(),
})

const UpdateTaskSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).optional(),
  tag: z.enum(['work', 'life', 'urgent']).optional(),
  is_done: z.boolean().optional(),
  date: z.string().optional(),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
})

export async function createTask(input: z.infer<typeof CreateTaskSchema>) {
  const parsed = CreateTaskSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('tasks').insert({
    ...parsed.data,
    user_id: user.id,
  })
  if (error) throw error

  revalidatePath('/today')
}

export async function updateTask(input: z.infer<typeof UpdateTaskSchema>) {
  const parsed = UpdateTaskSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { id, ...updates } = parsed.data
  const { error } = await supabase.from('tasks').update(updates).eq('id', id)
  if (error) throw error

  revalidatePath('/today')
}

export async function deleteTask(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/today')
}
