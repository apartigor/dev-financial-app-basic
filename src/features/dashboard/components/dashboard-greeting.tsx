"use client"
import { useLanguage } from "@/shared/lib/i18n/provider"

interface Props {
  firstName: string
  overdueCount: number
  upcomingWeekCount: number
}

export function DashboardGreeting({ firstName, overdueCount, upcomingWeekCount }: Props) {
  const { lang } = useLanguage()

  const greeting = lang === "en" ? `Hello, ${firstName}.` : `Olá, ${firstName}.`

  const encouragement = overdueCount === 0
    ? (lang === "en"
        ? `You're all caught up. ${upcomingWeekCount} payment${upcomingWeekCount !== 1 ? "s" : ""} due this week.`
        : `Você está em dia. Faltam ${upcomingWeekCount} pagamento${upcomingWeekCount !== 1 ? "s" : ""} esta semana.`)
    : (lang === "en"
        ? `${overdueCount} debt${overdueCount !== 1 ? "s" : ""} to sort out. No rush.`
        : `${overdueCount} dívida${overdueCount !== 1 ? "s" : ""} pra colocar em dia. Sem pressa.`)

  return (
    <>
      {/* Mobile: replaces AppShell header — needs top padding + "budFin" subtitle */}
      <div className="md:hidden flex-shrink-0 px-[22px] pt-[52px] pb-2 -mx-[22px] -mt-2">
        <p className="text-[12px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">budFin</p>
        <h1 className="font-serif text-[32px] leading-[1.05] tracking-[-0.6px] text-ink">{greeting}</h1>
        <p className="text-xs text-ink-muted mt-1 tracking-[0.3px]">{encouragement}</p>
      </div>

      {/* Desktop: inline, no extra padding */}
      <div className="hidden md:block mb-3">
        <h1 className="font-serif text-[32px] leading-[1.05] tracking-[-0.6px] text-ink">{greeting}</h1>
        <p className="text-xs text-ink-muted mt-1 tracking-[0.3px]">{encouragement}</p>
      </div>
    </>
  )
}

export function DashboardViewAll() {
  const { lang } = useLanguage()
  return <span className="text-[13px] text-ink-muted">{lang === "en" ? "View all →" : "Ver todas →"}</span>
}

export function DashboardUpcomingLabel() {
  const { lang } = useLanguage()
  return <>{lang === "en" ? "Upcoming" : "Próximos vencimentos"}</>
}
