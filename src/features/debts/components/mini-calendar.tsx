"use client"
import { useState } from "react"
import { cn } from "@/shared/lib/cn"

const WEEK_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"]

interface MiniCalendarProps {
  dueDate: string
  onPick: (date: string) => void
}

export function MiniCalendar({ dueDate, onPick }: MiniCalendarProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (!dueDate) return null

  const due = new Date(dueDate + "T00:00:00")
  const monthStart = new Date(due.getFullYear(), due.getMonth(), 1)
  const monthEnd   = new Date(due.getFullYear(), due.getMonth() + 1, 0)
  const startDay   = monthStart.getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(d)

  const monthLabel = due.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  function handlePick() {
    if (selected === null) return
    const date = new Date(due.getFullYear(), due.getMonth(), selected)
    const iso = date.toISOString().slice(0, 10)
    onPick(iso)
    setSelected(null)
  }

  return (
    <div className="mt-2.5 p-3 rounded-sm bg-bg border border-hairline">
      <p className="text-xs font-medium text-ink text-center mb-2.5 capitalize">{monthLabel}</p>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEK_LABELS.map((l, i) => (
          <div key={i} className="text-center text-[10px] text-ink-faint font-medium">{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={i} />
          const isDue = d === due.getDate()
          const isFuture = d >= due.getDate()
          const isSelected = d === selected

          return (
            <button
              key={i}
              type="button"
              disabled={isFuture}
              onClick={() => { setSelected(d); }}
              className={cn(
                "h-[30px] rounded-[6px] border-none text-xs font-sans cursor-pointer transition-colors",
                isSelected ? "bg-accent text-white" :
                isDue ? "bg-warn-soft text-warn font-semibold" :
                isFuture ? "text-ink-faint cursor-default" :
                "text-ink hover:bg-accent-soft"
              )}
            >
              {d}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <p className="text-[10px] text-ink-faint">
          <span className="text-warn">●</span> vencimento
        </p>
        {selected !== null && (
          <button
            type="button"
            onClick={handlePick}
            className="text-xs text-accent font-medium bg-transparent border-none cursor-pointer"
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  )
}
