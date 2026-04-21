"use client"
import { toZonedTime } from "date-fns-tz"
import { addDays, format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { useLanguage } from "@/shared/lib/i18n/provider"
import type { CalendarDay } from "../queries"

const TZ = "America/Sao_Paulo"
const WEEK_LABELS_PT = ["D", "S", "T", "Q", "Q", "S", "S"]
const WEEK_LABELS_EN = ["S", "M", "T", "W", "T", "F", "S"]

interface CalendarStripProps { days: CalendarDay[] }

export function CalendarStrip({ days }: CalendarStripProps) {
  const { lang } = useLanguage()
  const locale = lang === "en" ? enUS : ptBR
  const weekLabels = lang === "en" ? WEEK_LABELS_EN : WEEK_LABELS_PT

  const today = toZonedTime(new Date(), TZ)
  const startDate = days[0]  ? toZonedTime(new Date(days[0].date  + "T00:00:00"), TZ) : today
  const endDate   = days[13] ? toZonedTime(new Date(days[13].date + "T00:00:00"), TZ) : addDays(today, 13)
  const monthLabel = `${format(startDate, "MMM", { locale })} – ${format(endDate, "MMM", { locale })}`
  const headerLabel = lang === "en" ? "Next 14 days" : "Próximos 14 dias"

  return (
    <div className="bg-surface border border-hairline rounded-lg p-4 mt-3 md:mt-0">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-sm font-medium">{headerLabel}</span>
        <span className="text-[11px] text-ink-faint capitalize">{monthLabel}</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const date = toZonedTime(new Date(day.date + "T00:00:00"), TZ)
          const dayOfWeek = date.getDay()
          const dayNum = date.getDate()
          const hasDebts = day.debtCount > 0

          return (
            <div key={day.date}
              className={["flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-sm min-h-[52px]",
                "border transition-colors",
                day.isToday ? "bg-ink text-bg border-transparent" :
                hasDebts    ? "bg-accent-soft border-transparent" :
                "bg-transparent border-hairline",
              ].join(" ")}>
              <span className={`text-[9px] font-medium uppercase ${day.isToday ? "text-bg opacity-80" : "text-ink-faint"}`}>
                {weekLabels[dayOfWeek]}
              </span>
              <span className={`font-serif text-[17px] leading-none ${day.isToday ? "text-bg" : "text-ink"}`}>
                {dayNum}
              </span>
              {hasDebts && (
                <span className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(day.debtCount, 3) }).map((_, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${day.isToday ? "bg-bg" : "bg-accent"}`} />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
