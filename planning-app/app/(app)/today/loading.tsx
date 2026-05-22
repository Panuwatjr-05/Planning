function TaskSkeleton() {
  return <div className="h-11 bg-muted animate-pulse rounded-lg" />
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-border space-y-2">
        <div className="h-3 w-24 bg-muted animate-pulse rounded opacity-50" />
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-11 bg-muted animate-pulse rounded-xl" />
      <div className="h-2 bg-muted animate-pulse rounded-full" />
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((col) => (
          <div key={col} className="space-y-2">
            <div className="h-4 w-16 bg-muted animate-pulse rounded pb-2" />
            {[...Array(col === 2 ? 3 : 1)].map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
