"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { useLanguage } from "@/shared/lib/i18n/provider"

const WEEK_LABELS_PT = ["D", "S", "T", "Q", "Q", "S", "S"]
const WEEK_LABELS_EN = ["S", "M", "T", "W", "T", "F", "S"]

function pad(n: number) { return String(n).padStart(2, "0") }
function toISO(y: number, m: number, d: number) { return `${y}-${pad(m + 1)}-${pad(d)}` }

interface MiniCalendarProps {
  /** In "multiple" mode: the due date used to block dates >= due. In "single" mode: the currently selected date (for initial navigation) */
  dueDate: string
  onPick: (dates: string[]) => void
  /** "single" = click confirms immediately; "multiple" = toggle + confirm button */
  mode?: "single" | "multiple"
  coveredDates?: string[]
  initialSelected?: string[]
}

export function MiniCalendar({
  dueDate,
  onPick,
  mode = "multiple",
  coveredDates = [],
  initialSelected = [],
}: MiniCalendarProps) {
  const { lang } = useLanguage()
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelected))

  const initialRef = dueDate ? new Date(dueDate + "T00:00:00") : new Date()
  const [viewYear,  setViewYear]  = useState(initialRef.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialRef.getMonth())

  // "due" only applies in "multiple" mode for restricting reminder dates
  const due = mode === "multiple" && dueDate ? new Date(dueDate + "T00:00:00") : null
  const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0)

  function navMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const monthStart = new Date(viewYear, viewMonth, 1)
  const monthEnd   = new Date(viewYear, viewMonth + 1, 0)
  const startDay   = monthStart.getDay()

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(d)

  const locale = lang === "en" ? "en-US" : "pt-BR"
  const ref = new Date(viewYear, viewMonth, 1)
  const monthLabel = ref.toLocaleDateString(locale, { month: "long", year: "numeric" })
  const weekLabels = lang === "en" ? WEEK_LABELS_EN : WEEK_LABELS_PT

  function toggleDay(d: number) {
    const iso = toISO(viewYear, viewMonth, d)
    if (mode === "single") {
      setSelected(new Set([iso]))
      onPick([iso])
      return
    }
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  function handleConfirm() {
    if (selected.size === 0) return
    onPick([...selected].sort())
    setSelected(new Set())
  }

  const dueInView = due && due.getFullYear() === viewYear && due.getMonth() === viewMonth

  return (
    <div className="mt-2.5 p-3 rounded-sm bg-bg border border-hairline">
      <div className="flex items-center justify-between mb-2.5">
        <button type="button" onClick={() => navMonth(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-surface-alt text-ink-muted transition-colors">
          <ChevronLeft size={14} />
        </button>
        <p className="text-xs font-medium text-ink capitalize">{monthLabel}</p>
        <button type="button" onClick={() => navMonth(1)}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-surface-alt text-ink-muted transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekLabels.map((l, i) => (
          <div key={i} className="text-center text-[10px] text-ink-faint font-medium">{l}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={i} />
          const iso       = toISO(viewYear, viewMonth, d)
          const thisDate  = new Date(viewYear, viewMonth, d)
          const isDue     = mode === "multiple" && dueInView ? d === due!.getDate() : false
          const isCovered = coveredDates.includes(iso)
          const isDisabled =
            thisDate < todayDate ||
            (mode === "multiple" && (isCovered || (due ? thisDate > due : false)))
          const isSelected = selected.has(iso)

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => toggleDay(d)}
              className={cn(
                "h-[30px] rounded-[6px] border-none text-xs font-sans transition-colors relative",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
                isSelected  ? "bg-accent text-white cursor-pointer" :
                isDue       ? "bg-warn-soft text-warn font-semibold cursor-pointer" :
                isCovered   ? "bg-paid-soft text-paid font-medium cursor-not-allowed" :
                isDisabled  ? "text-ink-faint cursor-not-allowed opacity-35" :
                "text-ink cursor-pointer"
              )}
            >
              {d}
            </button>
          )
        })}
      </div>

      {mode === "multiple" && (
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-hairline">
          <p className="text-[10px] text-ink-faint">
            <span className="flex items-center gap-2.5 flex-wrap">
              {due && (
                <span className="flex items-center gap-1">
                  <span className="text-warn">●</span>
                  <span>{lang === "en" ? "due date" : "vencimento"}</span>
                  {!dueInView && (
                    <span className="text-ink-faint">
                      ({due.toLocaleDateString(locale, { month: "short", day: "numeric" })})
                    </span>
                  )}
                </span>
              )}
              {selected.size > 0 && (
                <span className="text-accent">
                  {lang === "en" ? `${selected.size} selected` : `${selected.size} selecionada${selected.size !== 1 ? "s" : ""}`}
                </span>
              )}
            </span>
          </p>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="text-xs text-accent font-medium bg-transparent border-none cursor-pointer disabled:opacity-40 disabled:cursor-default"
          >
            {lang === "en" ? "Add selected" : "Adicionar selecionadas"}
          </button>
        </div>
      )}
    </div>
  )
}
