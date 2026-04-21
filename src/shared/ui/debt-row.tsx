import { cn } from "@/shared/lib/cn"
import { Repeat2 } from "lucide-react"
import { Money } from "./money"
import { StatusDot } from "./status-dot"
import { StatusLabel } from "./status-label"
import { ProgressBar } from "./progress-bar"
import { daysUntilDue, formatDateBR } from "@/shared/lib/date"

type DebtStatus = "pending" | "overdue" | "paid" | "empty"

export interface DebtRowData {
  id: string
  title: string
  totalCents: number
  paidCents: number
  dueDate: string
  status: DebtStatus
  recurrenceRule?: string
  itemsCount: number
  itemsPaidCount: number
}

interface DebtRowProps {
  debt: DebtRowData
  onClick?: () => void
  compact?: boolean
  className?: string
}

export function DebtRow({ debt, onClick, compact = false, className }: DebtRowProps) {
  const days = daysUntilDue(debt.dueDate)
  const hasSubs = debt.itemsCount > 1
  const progress = debt.totalCents > 0 ? debt.paidCents / debt.totalCents : 0
  const showProgress = hasSubs || debt.status === "paid"
  const progressTone = progress === 1 ? "paid" : debt.status === "overdue" ? "warn" : "accent"
  const pad = compact ? "p-3" : "p-4"

  return (
    <button
      onClick={onClick}
      data-debt-row
      className={cn(
        "w-full text-left bg-surface border border-hairline rounded-md",
        "flex flex-col cursor-default transition-all duration-200",
        onClick && "cursor-pointer hover:border-hairline-strong",
        compact ? "gap-2" : "gap-2.5",
        pad,
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusDot status={debt.status} />
            <span
              className={cn(
                "font-medium truncate",
                compact ? "text-sm" : "text-base"
              )}
            >
              {debt.title}
            </span>
            {debt.recurrenceRule && debt.recurrenceRule !== "none" && (
              <Repeat2 size={12} className="text-ink-faint flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-faint">{formatDateBR(debt.dueDate)}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-ink-faint opacity-50" />
            <StatusLabel status={debt.status} days={days} />
          </div>
        </div>

        {/* Right: amount + sub count */}
        <div className="text-right flex-shrink-0">
          <Money
            cents={debt.totalCents}
            size={compact ? 18 : 20}
            tone={debt.status === "paid" ? "paid" : "default"}
          />
          {hasSubs && (
            <p className="text-[11px] text-ink-faint mt-0.5">
              {debt.itemsPaidCount}/{debt.itemsCount} receberam
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <ProgressBar value={progress} tone={progressTone} height={4} />
      )}
    </button>
  )
}
