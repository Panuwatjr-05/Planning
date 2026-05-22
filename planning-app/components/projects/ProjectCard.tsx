'use client'

import { useOptimistic, useTransition, useState } from 'react'
import Link from 'next/link'
import { togglePinProject, deleteProject } from '@/actions/projects'
import { type Tables } from '@/types/database'
import { Trash2, FolderKanban, Pin } from 'lucide-react'

interface ProjectCardProps {
  project: Tables<'projects'>
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticPinned, setOptimisticPinned] = useOptimistic(project.is_pinned)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handlePin(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    startTransition(async () => {
      setOptimisticPinned(!optimisticPinned)
      await togglePinProject(project.id, !project.is_pinned)
    })
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2500)
      return
    }
    startTransition(async () => { await deleteProject(project.id) })
  }

  const dateStr = new Date(project.created_at).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short',
  })

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group relative block bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 hover:shadow-md transition-all duration-200"
    >
      {project.images?.[0] && (
        <div className="w-full h-32 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.images[0]} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {!project.images?.[0] && (
        <div className="w-full h-24 bg-muted/60 flex items-center justify-center border-b border-border/40">
          <div className="w-11 h-11 rounded-2xl bg-background/80 flex items-center justify-center shadow-sm">
            <FolderKanban size={20} className="text-muted-foreground/70" />
          </div>
        </div>
      )}

      <div className="p-4">

        <p className={`font-semibold text-sm leading-snug line-clamp-2 ${project.is_completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {project.title}
        </p>

        <div className="mt-1.5 min-h-[28px]">
          {project.description ? (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/30 italic">ยังไม่มีรายละเอียด</p>
          )}
        </div>

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
              onClick={handleDelete}
              disabled={isPending}
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
