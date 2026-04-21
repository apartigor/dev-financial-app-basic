"use client"
import { cn } from "@/shared/lib/cn"
import { TabBar } from "./tab-bar"
import { DesktopSidebar } from "./desktop-sidebar"
import { useLanguage } from "@/shared/lib/i18n/provider"

type TitleKey = "home" | "debts" | "newDebt" | "editDebt" | "settings"

const titleKeyMap: Record<TitleKey, { pt: string; en: string }> = {
  home:     { pt: "Início",      en: "Home" },
  debts:    { pt: "Dívidas",     en: "Debts" },
  newDebt:  { pt: "Nova dívida", en: "New debt" },
  editDebt: { pt: "Editar",      en: "Edit" },
  settings: { pt: "Ajustes",     en: "Settings" },
}

interface AppShellProps {
  children: React.ReactNode
  title?: string
  titleKey?: TitleKey
  subtitle?: string
  headerRight?: React.ReactNode
  noPad?: boolean
  noTab?: boolean
  className?: string
}

export function AppShell({
  children, title, titleKey, subtitle, headerRight, noPad, noTab, className,
}: AppShellProps) {
  const { lang } = useLanguage()
  const resolvedTitle = titleKey ? titleKeyMap[titleKey][lang] : title

  return (
    <div className={cn("min-h-screen bg-bg text-ink md:flex", className)}>
      <DesktopSidebar />
      <div className="flex-1 flex flex-col md:overflow-auto">
        {resolvedTitle !== undefined && (
          <>
            <div className="md:hidden flex-shrink-0 px-[22px] pt-[52px] pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {subtitle && (
                    <p className="text-[12px] font-medium text-ink-muted uppercase tracking-[0.6px] mb-1">{subtitle}</p>
                  )}
                  <h1 className="font-serif text-[32px] leading-[1.05] tracking-[-0.6px] text-ink">{resolvedTitle}</h1>
                </div>
                {headerRight}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-between gap-3 px-8 pt-[22px] pb-2">
              <h1 className="font-serif text-[32px] tracking-[-0.6px] text-ink">{resolvedTitle}</h1>
              {headerRight}
            </div>
          </>
        )}
        <div className={cn("flex-1", !noPad && "px-[22px] pt-2 pb-[88px] md:px-8 md:pt-4 md:pb-8", "md:max-w-[900px]")}>
          {children}
        </div>
      </div>
      {!noTab && <div className="md:hidden"><TabBar /></div>}
    </div>
  )
}
