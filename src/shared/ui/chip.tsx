import { cn } from "@/shared/lib/cn"

type ChipTone = "default" | "accent" | "warn" | "paid" | "active"

const toneClass: Record<ChipTone, string> = {
  default: "bg-surface text-ink border border-hairline-strong",
  accent:  "bg-accent-soft text-accent border border-transparent",
  warn:    "bg-warn-soft text-warn border border-transparent",
  paid:    "bg-paid-soft text-paid border border-transparent",
  active:  "bg-ink text-bg border border-transparent",
}

interface ChipProps {
  children: React.ReactNode
  tone?: ChipTone
  active?: boolean
  size?: "sm" | "md"
  onClick?: () => void
  className?: string
}

export function Chip({ children, tone = "default", active, size = "md", onClick, className }: ChipProps) {
  const resolvedTone: ChipTone = active ? "active" : tone
  const sizeClass = size === "sm" ? "h-6 px-2.5 text-xs" : "h-[30px] px-3 text-[13px]"

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill font-medium whitespace-nowrap",
        "cursor-default transition-colors",
        onClick && "cursor-pointer",
        sizeClass,
        toneClass[resolvedTone],
        className
      )}
    >
      {children}
    </button>
  )
}
