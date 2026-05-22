'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

const AuthSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})

export async function login(_prev: unknown, formData: FormData) {
  const parsed = AuthSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }

  redirect('/today')
}

export async function register(_prev: unknown, formData: FormData) {
  const parsed = AuthSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: 'ข้อมูลไม่ถูกต้อง' }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp(parsed.data)
  if (error) return { error: error.message }

  redirect('/today')
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
