'use client'

import { create } from 'zustand'

interface UIStore {
  isAddTaskOpen: boolean
  openAddTask: () => void
  closeAddTask: () => void

  isAddGoalOpen: boolean
  openAddGoal: () => void
  closeAddGoal: () => void

  isAddProjectOpen: boolean
  openAddProject: () => void
  closeAddProject: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isAddTaskOpen: false,
  openAddTask: () => set({ isAddTaskOpen: true }),
  closeAddTask: () => set({ isAddTaskOpen: false }),

  isAddGoalOpen: false,
  openAddGoal: () => set({ isAddGoalOpen: true }),
  closeAddGoal: () => set({ isAddGoalOpen: false }),

  isAddProjectOpen: false,
  openAddProject: () => set({ isAddProjectOpen: true }),
  closeAddProject: () => set({ isAddProjectOpen: false }),
}))
