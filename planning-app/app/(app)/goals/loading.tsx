export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-border space-y-2">
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        <div className="h-3.5 w-52 bg-muted animate-pulse rounded opacity-50" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-2xl p-4 space-y-3">
            <div className="h-3.5 w-16 bg-muted animate-pulse rounded" />
            <div className="h-1.5 bg-muted animate-pulse rounded-full" />
            <div className="h-7 w-12 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="border rounded-2xl p-4 h-24 bg-muted/30 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
