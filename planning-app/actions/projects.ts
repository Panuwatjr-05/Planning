'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const CreateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
})

const UpdateProjectSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
})

export async function createProject(input: z.infer<typeof CreateProjectSchema>) {
  const parsed = CreateProjectSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('projects').insert({ ...parsed.data, user_id: user.id })
  if (error) throw error

  revalidatePath('/projects')
}

export async function updateProject(input: z.infer<typeof UpdateProjectSchema>) {
  const parsed = UpdateProjectSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { id, ...updates } = parsed.data
  const { error } = await supabase.from('projects').update(updates).eq('id', id)
  if (error) throw error

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
}

export async function addProjectImage(projectId: string, imageUrl: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase.from('projects').select('images').eq('id', projectId).single()
  const images = [...(project?.images ?? []), imageUrl]
  const { error } = await supabase.from('projects').update({ images }).eq('id', projectId)
  if (error) throw error

  revalidatePath(`/projects/${projectId}`)
}

export async function removeProjectImage(projectId: string, imageUrl: string, publicId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: project } = await supabase.from('projects').select('images').eq('id', projectId).single()
  const images = (project?.images ?? []).filter((u: string) => u !== imageUrl)
  const { error } = await supabase.from('projects').update({ images }).eq('id', projectId)
  if (error) throw error

  const timestamp = Math.round(Date.now() / 1000)
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
    .digest('hex')

  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: timestamp.toString(),
    api_key: process.env.CLOUDINARY_API_KEY!,
    signature,
  })

  await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
    { method: 'POST', body }
  )

  revalidatePath(`/projects/${projectId}`)
}

export async function toggleCompleteProject(id: string, is_completed: boolean) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('projects').update({ is_completed }).eq('id', id)
  if (error) throw error

  revalidatePath('/goals')
  revalidatePath('/projects')
}

export async function togglePinProject(id: string, is_pinned: boolean) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('projects').update({ is_pinned }).eq('id', id)
  if (error) throw error

  revalidatePath('/projects')
}

export async function deleteProject(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/projects')
}
