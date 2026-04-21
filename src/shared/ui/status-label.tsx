"use client"
import { cn } from "@/shared/lib/cn"
import { useLanguage } from "@/shared/lib/i18n/provider"

type Status = "pending" | "overdue" | "paid" | "empty"

interface StatusLabelProps {
  status: Status
  days: number
  className?: string
}

export function StatusLabel({ status, days, className }: StatusLabelProps) {
  const { t } = useLanguage()
  let label: string
  let colorClass: string

  const dueInDays = (t.status.dueInDays ?? "Em {n} dias").replace("{n}", String(days))
  if (status === "paid") {
    label = t.status.paid ?? "Pago"; colorClass = "text-paid"
  } else if (status === "overdue") {
    label = `${t.status.overdue ?? "Atrasada"} ${Math.abs(days)}d`; colorClass = "text-warn"
  } else if (days === 0) {
    label = t.status.dueToday ?? "Vence hoje"; colorClass = "text-ink"
  } else if (days === 1) {
    label = t.status.dueTomorrow ?? "Vence amanhã"; colorClass = "text-ink"
  } else if (days > 1 && days <= 7) {
    label = dueInDays; colorClass = "text-accent"
  } else {
    label = dueInDays; colorClass = "text-ink-muted"
  }

  return (
    <span className={cn("text-xs font-medium tracking-tight", colorClass, className)}>
      {label}
    </span>
  )
}
