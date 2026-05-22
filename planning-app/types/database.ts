export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          tag: 'work' | 'life' | 'urgent'
          is_done: boolean
          date: string
          start_time: string | null
          end_time: string | null
          project_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          tag?: 'work' | 'life' | 'urgent'
          is_done?: boolean
          date?: string
          start_time?: string | null
          end_time?: string | null
          project_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          tag?: 'work' | 'life' | 'urgent'
          is_done?: boolean
          date?: string
          start_time?: string | null
          end_time?: string | null
          project_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          images: string[] | null
          is_completed: boolean
          is_pinned: boolean
          deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          images?: string[] | null
          is_completed?: boolean
          is_pinned?: boolean
          deadline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          images?: string[] | null
          is_completed?: boolean
          is_pinned?: boolean
          deadline?: string | null
          created_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          type: 'short' | 'long'
          progress: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type?: 'short' | 'long'
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: 'short' | 'long'
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          images: string[] | null
          tags: string[]
          is_pinned: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          images?: string[] | null
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          images?: string[] | null
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
        }
        Relationships: []
      }
      idea_tasks: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          title: string
          status: 'todo' | 'doing' | 'done'
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          user_id: string
          title: string
          status?: 'todo' | 'doing' | 'done'
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          user_id?: string
          title?: string
          status?: 'todo' | 'doing' | 'done'
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          status: 'todo' | 'doing' | 'done'
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          status?: 'todo' | 'doing' | 'done'
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          status?: 'todo' | 'doing' | 'done'
          order_index?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
