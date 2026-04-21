"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, List, Plus, Settings } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { LinkPendingIndicator } from "./link-pending-indicator"

const tabs = [
  { id: "dashboard", label: "Início",  href: "/dashboard", Icon: Home },
  { id: "debts",     label: "Dívidas", href: "/debts",     Icon: List },
  { id: "new",       label: "Nova",    href: "/debts/new", Icon: Plus },
  { id: "settings",  label: "Ajustes", href: "/settings",  Icon: Settings },
] as const

export function TabBar() {
  const pathname = usePathname()
  const hrefs = tabs.map((t) => t.href)
  function isActive(href: string) {
    if (pathname === href) return true
    if (!pathname.startsWith(href + "/")) return false
    return !hrefs.some((h) => h !== href && h.startsWith(href) && pathname.startsWith(h))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 px-3.5 pb-7 pt-2.5 z-20"
      style={{ background: "linear-gradient(to bottom, transparent, var(--color-bg) 40%)" }}>
      <nav className="flex justify-around bg-surface rounded-[20px] px-1 py-2
        border border-hairline shadow-[0_4px_16px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.03)]">
        {tabs.map(({ id, label, href, Icon }) => {
          const active = isActive(href)
          const isNew = id === "new"

          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "relative flex-1 flex flex-col items-center gap-0.5 py-1.5 transition-colors duration-200",
                active ? "text-ink" : "text-ink-faint"
              )}
            >
              <span className={cn(
                "relative flex items-center justify-center rounded-[10px] transition-all duration-200",
                isNew ? "bg-ink w-8 h-8" : "w-auto h-auto",
                active && !isNew && "scale-110"
              )}>
                <Icon
                  size={isNew ? 18 : 22}
                  strokeWidth={isNew ? 2.2 : 1.75}
                  className={isNew ? "text-bg" : ""}
                />
                <span className="absolute -top-1 -right-1">
                  <LinkPendingIndicator />
                </span>
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
