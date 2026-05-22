interface ProgressBarProps {
  value: number
  total: number
}

export function ProgressBar({ value, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100)

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, background: 'oklch(0.55 0.17 145)' }}
        />
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {value}/{total}
      </span>
    </div>
  )
}
