import { cn } from "@/shared/lib/cn"

type Status = "pending" | "overdue" | "paid" | "empty"

interface StatusLabelProps {
  status: Status
  days: number
  className?: string
}

export function StatusLabel({ status, days, className }: StatusLabelProps) {
  let label: string
  let colorClass: string

  if (status === "paid") {
    label = "Pago"
    colorClass = "text-paid"
  } else if (status === "overdue") {
    label = `Atrasada ${Math.abs(days)}d`
    colorClass = "text-warn"
  } else if (days === 0) {
    label = "Vence hoje"
    colorClass = "text-ink"
  } else if (days === 1) {
    label = "Vence amanhã"
    colorClass = "text-ink"
  } else if (days > 1 && days <= 7) {
    label = `Em ${days} dias`
    colorClass = "text-accent"
  } else {
    label = `Em ${days} dias`
    colorClass = "text-ink-muted"
  }

  return (
    <span className={cn("text-xs font-medium tracking-tight", colorClass, className)}>
      {label}
    </span>
  )
}
