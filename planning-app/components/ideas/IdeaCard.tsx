'use client'

import { useOptimistic, useTransition, useState } from 'react'
import Link from 'next/link'
import { togglePinIdea, deleteIdea } from '@/actions/ideas'
import { type Tables } from '@/types/database'
import { Pin, Trash2, Lightbulb } from 'lucide-react'

export function IdeaCard({ idea }: { idea: Tables<'ideas'> }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPinned, setOptimisticPinned] = useOptimistic(idea.is_pinned)
  const [optimisticDeleted, setOptimisticDeleted] = useOptimistic(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handlePin(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    startTransition(async () => {
      setOptimisticPinned(!optimisticPinned)
      await togglePinIdea(idea.id, !idea.is_pinned)
    })
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
      return
    }
    startTransition(async () => { setOptimisticDeleted(true); await deleteIdea(idea.id) })
  }

  if (optimisticDeleted) return null

  const dateStr = new Date(idea.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="group relative block bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200"
    >
      {/* Cover image */}
      {idea.images?.[0] && (
        <div className="w-full h-32 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={idea.images[0]} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-4">
        {/* Icon — only when no cover image */}
        {!idea.images?.[0] && (
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Lightbulb size={15} className="text-muted-foreground" />
          </div>
        )}

        {/* Title */}
        <p className="font-semibold text-sm leading-snug line-clamp-2 text-foreground">
          {idea.title}
        </p>

        {/* Content preview */}
        <div className="mt-1.5 min-h-[28px]">
          {idea.content ? (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {idea.content}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/30 italic">ยังไม่มีรายละเอียด</p>
          )}
        </div>

        {/* Tags */}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {idea.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
          <button
            onClick={handlePin}
            disabled={isPending}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <Pin size={10} fill={optimisticPinned ? 'currentColor' : 'none'}
              className={optimisticPinned ? 'text-foreground' : ''} />
            <span className={optimisticPinned ? 'text-foreground font-medium' : ''}>
              {optimisticPinned ? 'ปักหมุดแล้ว' : 'ปักหมุด'}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{dateStr}</span>
            <button
              onClick={handleDelete} disabled={isPending}
              className={`text-xs px-1.5 py-0.5 rounded transition-all
                ${confirmDelete
                  ? 'text-destructive bg-destructive/10 font-medium'
                  : 'opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive hover:bg-muted'}`}
            >
              {confirmDelete ? 'ลบ?' : <Trash2 size={11} />}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
