'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { type Tables } from '@/types/database'

export function useGoals() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Tables<'goals'>[]
    },
  })
}

export function useUpdateGoalProgress() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const is_completed = progress === 100
      const { error } = await supabase
        .from('goals')
        .update({
          progress,
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
      if (error) throw error
      return { is_completed }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
