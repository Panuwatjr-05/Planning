'use client'

import { useRef, useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createIdea } from '@/actions/ideas'

export function IdeaForm() {
  const [title, setTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) return
    startTransition(async () => {
      await createIdea({ title: title.trim(), tags: [] })
      setTitle('')
      inputRef.current?.focus()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="จดไอเดียใหม่..."
        disabled={isPending}
        className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm bg-background focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/40 transition-colors"
      />
      <button
        type="submit"
        disabled={!title.trim() || isPending}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-foreground text-background rounded-xl text-sm font-semibold disabled:opacity-30 hover:opacity-85 transition-opacity"
      >
        <Plus size={15} />
        เพิ่ม
      </button>
    </form>
  )
}
