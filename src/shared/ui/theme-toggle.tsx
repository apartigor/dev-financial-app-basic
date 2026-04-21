"use client"
import { useState, useEffect, useTransition } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/shared/lib/cn"
import { updatePreferences } from "@/features/settings/actions"

interface Props {
  className?: string
  variant?: "icon" | "full"
}

export function ThemeToggle({ className, variant = "icon" }: Props) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => { setMounted(true) }, [])

  function toggle() {
    const next = (resolvedTheme === "dark" ? "light" : "dark") as "light" | "dark"
    setTheme(next)
    startTransition(() => { void updatePreferences({ theme: next }) })
  }

  if (!mounted) {
    // Placeholder matching size to avoid layout shift
    return <div className={cn("w-9 h-9", className)} />
  }

  const isDark = resolvedTheme === "dark"

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3.5 bg-surface",
          "border border-hairline rounded-md transition-colors hover:border-hairline-strong",
          className
        )}
      >
        <span className="flex items-center gap-3">
          <span className="w-[30px] h-[30px] rounded-[8px] bg-accent-soft text-accent flex items-center justify-center">
            {isDark ? <Moon size={15} /> : <Sun size={15} />}
          </span>
          <span className="text-sm text-ink">Tema {isDark ? "escuro" : "claro"}</span>
        </span>
        <span className="text-xs text-ink-faint">{isDark ? "Mudar para claro" : "Mudar para escuro"}</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className={cn(
        "flex items-center justify-center w-9 h-9 rounded-[8px]",
        "text-ink-muted hover:bg-surface-alt hover:text-ink transition-colors",
        className
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
