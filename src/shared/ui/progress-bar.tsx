import { cn } from "@/shared/lib/cn"

type ProgressTone = "accent" | "paid" | "warn"

const fillClass: Record<ProgressTone, string> = {
  accent: "bg-accent",
  paid:   "bg-paid",
  warn:   "bg-warn",
}

interface ProgressBarProps {
  /** 0–1 */
  value: number
  tone?: ProgressTone
  height?: number
  className?: string
}

export function ProgressBar({ value, tone = "accent", height = 6, className }: ProgressBarProps) {
  const clampedValue = Math.min(1, Math.max(0, value))
  const activeTone: ProgressTone = clampedValue === 1 ? "paid" : tone

  return (
    <div
      className={cn("w-full overflow-hidden rounded-pill bg-hairline", className)}
      style={{ height }}
    >
      <div
        className={cn("h-full rounded-pill transition-all duration-300", fillClass[activeTone])}
        style={{ width: `${clampedValue * 100}%` }}
      />
    </div>
  )
}
