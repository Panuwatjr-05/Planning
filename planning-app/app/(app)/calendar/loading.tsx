export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-24 bg-muted animate-pulse rounded" />
      <div className="h-[calc(100vh-140px)] bg-muted animate-pulse rounded-xl" />
    </div>
  )
}
