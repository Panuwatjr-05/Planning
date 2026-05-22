'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const CreateIdeaSchema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

const UpdateIdeaSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).optional(),
  content: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  is_pinned: z.boolean().optional(),
})

export async function createIdea(input: z.infer<typeof CreateIdeaSchema>) {
  const parsed = CreateIdeaSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('ideas').insert({ ...parsed.data, user_id: user.id })
  if (error) throw error

  revalidatePath('/ideas')
}

export async function updateIdea(input: z.infer<typeof UpdateIdeaSchema>) {
  const parsed = UpdateIdeaSchema.safeParse(input)
  if (!parsed.success) throw new Error('Invalid input')

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { id, ...updates } = parsed.data
  const { error } = await supabase.from('ideas').update(updates).eq('id', id)
  if (error) throw error

  revalidatePath('/ideas')
  revalidatePath(`/ideas/${id}`)
}

export async function togglePinIdea(id: string, is_pinned: boolean) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('ideas').update({ is_pinned }).eq('id', id)
  if (error) throw error

  revalidatePath('/ideas')
}

export async function addIdeaImage(ideaId: string, imageUrl: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: idea } = await supabase.from('ideas').select('images').eq('id', ideaId).single()
  const images = [...(idea?.images ?? []), imageUrl]
  const { error } = await supabase.from('ideas').update({ images }).eq('id', ideaId)
  if (error) throw error

  revalidatePath(`/ideas/${ideaId}`)
}

export async function removeIdeaImage(ideaId: string, imageUrl: string, publicId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: idea } = await supabase.from('ideas').select('images').eq('id', ideaId).single()
  const images = (idea?.images ?? []).filter((u: string) => u !== imageUrl)
  const { error } = await supabase.from('ideas').update({ images }).eq('id', ideaId)
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

  revalidatePath(`/ideas/${ideaId}`)
}

export async function deleteIdea(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) throw error

  revalidatePath('/ideas')
}
