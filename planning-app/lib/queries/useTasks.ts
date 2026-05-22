'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { type Tables } from '@/types/database'

export function useTasks(date: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['tasks', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Tables<'tasks'>[]
    },
  })
}

export function useToggleTask() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_done }: { id: string; is_done: boolean }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ is_done })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
