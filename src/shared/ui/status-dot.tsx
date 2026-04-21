import { cn } from "@/shared/lib/cn"

type Status = "pending" | "overdue" | "paid" | "empty"

const statusClass: Record<Status, string> = {
  pending: "bg-accent",
  overdue: "bg-warn",
  paid:    "bg-paid",
  empty:   "bg-hairline",
}

interface StatusDotProps {
  status: Status
  size?: number
  className?: string
}

export function StatusDot({ status, size = 8, className }: StatusDotProps) {
  return (
    <span
      className={cn("inline-block rounded-full flex-shrink-0", statusClass[status], className)}
      style={{ width: size, height: size }}
    />
  )
}
