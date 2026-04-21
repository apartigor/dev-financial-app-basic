"use client"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { useLanguage } from "@/shared/lib/i18n/provider"

const WEEK_LABELS_PT = ["D", "S", "T", "Q", "Q", "S", "S"]
const WEEK_LABELS_EN = ["S", "M", "T", "W", "T", "F", "S"]

function pad(n: number) { return String(n).padStart(2, "0") }
function toISODate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function fromISODate(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y!, m! - 1, d!)
}
function formatDateBR(s: string) {
  const d = fromISODate(s)
  if (!d) return ""
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

interface DatePickerProps {
  label?: string
  value: string
  onChange: (iso: string) => void
  error?: string
  minDate?: string
  className?: string
}

export function DatePicker({ label, value, onChange, error, minDate, className }: DatePickerProps) {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewDate, setViewDate] = useState<Date>(() => fromISODate(value) ?? new Date())
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (value) {
      const d = fromISODate(value)
      if (d) setViewDate(d)
    }
  }, [value])

  useEffect(() => {
    if (!open || isMobile) return
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) setOpen(false)
    }
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onClickOutside)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onClickOutside)
      document.removeEventListener("keydown", onEsc)
    }
  }, [open, isMobile])

  // Lock scroll on mobile when open
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isMobile, open])

  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const monthEnd   = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const startDay   = monthStart.getDay()
  const today      = new Date(); today.setHours(0, 0, 0, 0)
  const min        = minDate ? fromISODate(minDate) : null
  const locale = lang === "en" ? "en-US" : "pt-BR"
  const monthLabel = viewDate.toLocaleDateString(locale, { month: "long", year: "numeric" })

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= monthEnd.getDate(); d++) days.push(d)

  function pick(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    onChange(toISODate(d))
    setOpen(false)
  }

  function navMonth(delta: number) {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1))
  }

  const calendar = (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => navMonth(-1)}
          className="w-9 h-9 rounded-[8px] hover:bg-surface-alt flex items-center justify-center text-ink-muted transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-ink capitalize">{monthLabel}</span>
        <button type="button" onClick={() => navMonth(1)}
          className="w-9 h-9 rounded-[8px] hover:bg-surface-alt flex items-center justify-center text-ink-muted transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Week labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {(lang === "en" ? WEEK_LABELS_EN : WEEK_LABELS_PT).map((l, i) => (
          <div key={i} className="h-8 flex items-center justify-center text-[11px] text-ink-faint font-medium">
            {l}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />
          const date      = new Date(viewDate.getFullYear(), viewDate.getMonth(), d)
          const iso       = toISODate(date)
          const isSelected = value === iso
          const isToday   = date.getTime() === today.getTime()
          const isDisabled = min ? date < min : false

          return (
            <button key={i} type="button" disabled={isDisabled} onClick={() => pick(d)}
              className={cn(
                "h-10 rounded-[8px] text-[13px] font-sans transition-colors relative",
                isDisabled && "text-ink-faint cursor-not-allowed opacity-40",
                !isDisabled && !isSelected && !isToday && "text-ink hover:bg-surface-alt",
                isToday && !isSelected && "text-accent font-medium",
                isSelected && "bg-accent text-white font-medium"
              )}
            >
              {d}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between">
        <button type="button" onClick={() => { onChange(toISODate(today)); setOpen(false) }}
          className="text-xs text-accent font-medium bg-transparent border-none cursor-pointer">
          {lang === "en" ? "Today" : "Hoje"}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs text-ink-muted bg-transparent border-none cursor-pointer">
          {lang === "en" ? "Close" : "Fechar"}
        </button>
      </div>
    </div>
  )

  return (
    <div className={cn("relative", className)} ref={triggerRef}>
      {label && (
        <label className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px] mb-2 block">
          {label}
        </label>
      )}

      <button type="button" onClick={() => setOpen((o) => !o)}
        className={cn(
          "h-[46px] w-full flex items-center gap-2.5 bg-surface border rounded-sm px-3.5",
          "text-left text-base transition-colors hover:border-hairline-strong",
          error ? "border-warn" : "border-hairline"
        )}
      >
        <CalendarIcon size={16} className="text-ink-muted flex-shrink-0" />
        <span className={cn("flex-1 min-w-0 truncate capitalize", value ? "text-ink" : "text-ink-faint")}>
          {value
            ? (lang === "en"
                ? (() => { const d = fromISODate(value); return d ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "" })()
                : formatDateBR(value))
            : (lang === "en" ? "Select date" : "Selecionar data")}
        </span>
      </button>

      {error && <p className="mt-1.5 text-xs text-warn">{error}</p>}

      {/* Desktop: inline popover */}
      {open && !isMobile && (
        <div ref={popoverRef}
          className="absolute z-40 mt-2 left-0 w-72 bg-surface border border-hairline rounded-md shadow-xl p-3
            animate-in fade-in zoom-in-95 duration-150 origin-top-left"
        >
          {calendar}
        </div>
      )}

      {/* Mobile: bottom sheet via portal */}
      {open && isMobile && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="relative bg-surface rounded-t-lg border-t border-hairline px-4 pt-4 pb-8
            animate-in slide-in-from-bottom-4 duration-250">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-ink">Selecionar data</span>
              <button type="button" onClick={() => setOpen(false)}
                className="text-ink-faint hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>
            {calendar}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
