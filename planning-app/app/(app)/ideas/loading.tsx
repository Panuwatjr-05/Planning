function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="h-24 bg-muted animate-pulse" />
      <div className="p-4 space-y-2.5">
        <div className="h-3.5 bg-muted animate-pulse rounded w-4/5" />
        <div className="h-3 bg-muted animate-pulse rounded w-2/3 opacity-60" />
        <div className="h-px bg-border mt-3" />
        <div className="h-3 bg-muted animate-pulse rounded w-1/4 opacity-40" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-border space-y-2">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="h-3.5 w-36 bg-muted animate-pulse rounded opacity-50" />
      </div>
      <div className="h-11 bg-muted animate-pulse rounded-xl" />
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 220px))' }}>
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}
