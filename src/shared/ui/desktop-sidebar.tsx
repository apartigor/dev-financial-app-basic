"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, List, Plus, Settings, Bell } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { ThemeToggle } from "./theme-toggle"
import { LinkPendingIndicator } from "./link-pending-indicator"

const tabs = [
  { id: "dashboard", label: "Início",       href: "/dashboard", Icon: Home },
  { id: "debts",     label: "Dívidas",      href: "/debts",     Icon: List },
  { id: "new",       label: "Nova dívida",  href: "/debts/new", Icon: Plus },
  { id: "settings",  label: "Ajustes",      href: "/settings",  Icon: Settings },
] as const

export function DesktopSidebar() {
  const pathname = usePathname()
  const hrefs = tabs.map((t) => t.href)
  function isActive(href: string) {
    if (pathname === href) return true
    if (!pathname.startsWith(href + "/")) return false
    // Another tab has a longer, more specific prefix? Not active then.
    return !hrefs.some((h) => h !== href && h.startsWith(href) && pathname.startsWith(h))
  }

  return (
    <aside className="hidden md:flex md:flex-col w-60 bg-surface border-r border-hairline flex-shrink-0 h-screen sticky top-0 px-3.5 py-[22px]">
      <div className="px-2 pb-[22px] flex items-center justify-between">
        <BrandMark />
        <ThemeToggle />
      </div>

      <nav className="flex flex-col gap-0.5">
        {tabs.map(({ id, label, href, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-sm",
                "transition-all duration-200",
                active
                  ? "bg-surface-alt text-ink font-medium"
                  : "text-ink-muted hover:bg-surface-alt/60 hover:text-ink"
              )}
            >
              {/* Active bar indicator — slides in */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-pill bg-accent",
                  "transition-all duration-200 origin-left",
                  active ? "opacity-100 scale-y-100" : "opacity-0 scale-y-50"
                )}
              />
              {/* Pending (loading) bar overrides active bar */}
              <LinkPendingIndicator variant="bar" />

              <Icon
                size={16}
                strokeWidth={1.75}
                className={cn("transition-transform duration-200 flex-shrink-0",
                  "group-hover:scale-110"
                )}
              />
              <span className="flex-1">{label}</span>

              {/* Pending dot at the end */}
              <LinkPendingIndicator />
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      <div className="p-3 rounded-sm bg-surface-alt text-xs text-ink-muted leading-[1.4]">
        <div className="flex items-center gap-1.5 mb-1">
          <Bell size={12} className="text-accent" />
          <span className="text-ink font-medium">Notificações ativas</span>
        </div>
        Você receberá lembretes push conforme agendou em cada dívida.
      </div>
    </aside>
  )
}
