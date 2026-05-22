'use client'

import { useState, useTransition } from 'react'
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BoardItem = {
  id: string
  title: string
  status: 'todo' | 'doing' | 'done'
  order_index: number
  created_at: string
}

type Status = 'todo' | 'doing' | 'done'

const COLUMNS: { id: Status; label: string; dot: string }[] = [
  { id: 'todo',  label: 'ต้องทำ',    dot: 'text-violet-600 bg-violet-50 border-violet-200' },
  { id: 'doing', label: 'กำลังทำ',   dot: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'done',  label: 'เสร็จแล้ว', dot: 'text-green-600  bg-green-50  border-green-200'  },
]

interface KanbanBoardProps {
  initialItems: BoardItem[]
  onCreate: (title: string, status: Status, order_index: number) => Promise<void>
  onUpdateStatus: (id: string, status: Status) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function KanbanBoard({ initialItems, onCreate, onUpdateStatus, onDelete }: KanbanBoardProps) {
  const [items, setItems] = useState<BoardItem[]>(initialItems)
  const [activeItem, setActiveItem] = useState<BoardItem | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function getByStatus(status: Status) {
    return items.filter((t) => t.status === status).sort((a, b) => a.order_index - b.order_index)
  }

  function handleDragStart(e: DragStartEvent) {
    const item = items.find((t) => t.id === e.active.id)
    if (item) setActiveItem(item)
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const activeItem = items.find((t) => t.id === active.id)
    const overItem   = items.find((t) => t.id === over.id)
    const overCol    = COLUMNS.find((c) => c.id === over.id)
    if (!activeItem) return
    if (overCol && activeItem.status !== overCol.id) {
      setItems((prev) => prev.map((t) => t.id === activeItem.id ? { ...t, status: overCol.id } : t))
    } else if (overItem && activeItem.status !== overItem.status) {
      setItems((prev) => prev.map((t) => t.id === activeItem.id ? { ...t, status: overItem.status } : t))
    }
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveItem(null)
    if (!over) return
    const item = items.find((t) => t.id === active.id)
    if (!item) return
    const overCol   = COLUMNS.find((c) => c.id === over.id)
    const newStatus = overCol ? overCol.id : (items.find((t) => t.id === over.id)?.status ?? item.status)
    if (newStatus !== item.status) {
      startTransition(async () => { await onUpdateStatus(item.id, newStatus) })
    }
  }

  function handleAddCard(status: Status, title: string) {
    if (!title.trim()) return
    const order_index = getByStatus(status).length
    const tempId = crypto.randomUUID()
    setItems((prev) => [...prev, { id: tempId, title: title.trim(), status, order_index, created_at: new Date().toISOString() }])
    startTransition(async () => { await onCreate(title.trim(), status, order_index) })
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((t) => t.id !== id))
    startTransition(async () => { await onDelete(id) })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={getByStatus(col.id)}
            onAdd={(title) => handleAddCard(col.id, title)}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem && (
          <div className="bg-card rounded-lg border border-border shadow-lg px-3 py-2.5 text-[13px] rotate-2">
            {activeItem.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({
  column, tasks, onAdd, onDelete,
}: {
  column: typeof COLUMNS[0]
  tasks: BoardItem[]
  onAdd: (title: string) => void
  onDelete: (id: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft]   = useState('')

  function submit() {
    if (draft.trim()) onAdd(draft.trim())
    setDraft(''); setAdding(false)
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl p-3 min-h-[200px] bg-muted/50 w-52 shrink-0 md:w-auto md:shrink">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full border', column.dot)}>
            {column.label}
          </span>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
        <button onClick={() => setAdding(true)}
          className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
          <Plus size={13} />
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onDelete={onDelete} />
        ))}
      </SortableContext>

      {adding ? (
        <div className="bg-card rounded-lg border border-border p-2 space-y-2">
          <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
              if (e.key === 'Escape') { setAdding(false); setDraft('') }
            }}
            placeholder="ชื่องาน..." rows={2}
            className="w-full text-xs resize-none bg-transparent outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex gap-1.5">
            <button onClick={submit} className="px-2.5 py-1 bg-foreground text-background rounded text-[11px] font-medium">เพิ่ม</button>
            <button onClick={() => { setAdding(false); setDraft('') }} className="px-2.5 py-1 text-muted-foreground rounded text-[11px] hover:bg-muted">ยกเลิก</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-1 py-1">
          <Plus size={12} /> เพิ่มการ์ด
        </button>
      )}
    </div>
  )
}

function KanbanCard({ task, onDelete }: { task: BoardItem; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style}
      className="bg-card rounded-lg border border-border/70 px-3 py-2.5 group flex items-start gap-2 hover:border-border hover:shadow-sm transition-all">
      <button {...attributes} {...listeners}
        className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0">
        <GripVertical size={12} />
      </button>
      <p className="flex-1 text-[13px] leading-snug text-foreground">{task.title}</p>
      <button onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-destructive transition-all shrink-0">
        <Trash2 size={11} />
      </button>
    </div>
  )
}
