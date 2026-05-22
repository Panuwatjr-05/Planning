'use client'

import { useOptimistic, useTransition } from 'react'

export interface GridItem {
  id: string
  title: string
  isActive: boolean
}

const TOTAL_CELLS = 100

export interface OverviewGridProps {
  items: GridItem[]
  accent: string
  onToggle: (id: string, current: boolean) => Promise<void>
}

export function OverviewGrid({ items, accent, onToggle }: OverviewGridProps) {
  const empties = Math.max(0, TOTAL_CELLS - items.length)

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <GridCell key={item.id} item={item} accent={accent} onToggle={onToggle} />
      ))}
      {Array.from({ length: empties }).map((_, i) => (
        <div key={`empty-${i}`} className="w-5 h-5 rounded-sm bg-muted/60" />
      ))}
    </div>
  )
}

function GridCell({
  item, accent, onToggle,
}: {
  item: GridItem
  accent: string
  onToggle: (id: string, current: boolean) => Promise<void>
}) {
  const [, startTransition] = useTransition()
  const [optimisticActive, setOptimisticActive] = useOptimistic(item.isActive)

  function handleClick() {
    startTransition(async () => {
      setOptimisticActive(!optimisticActive)
      await onToggle(item.id, item.isActive)
    })
  }

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={`w-5 h-5 rounded-sm transition-all duration-150 hover:scale-125 hover:z-10 relative ${!optimisticActive ? 'bg-muted-foreground/50' : ''}`}
        style={optimisticActive ? { background: accent } : undefined}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded-md shadow-md whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 max-w-[160px] truncate border">
        {item.title}
      </div>
    </div>
  )
}
