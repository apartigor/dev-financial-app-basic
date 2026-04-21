"use client"
import { cn } from "@/shared/lib/cn"
import { useLanguage } from "@/shared/lib/i18n/provider"

interface Props {
  mode: "login" | "register"
  onChange: (mode: "login" | "register") => void
}

export function AuthSwitcher({ mode, onChange }: Props) {
  const { t } = useLanguage()
  return (
    <div className="relative flex bg-surface-alt/80 rounded-pill p-1 h-11 w-full mb-7 border border-hairline">
      <span
        aria-hidden
        className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-ink rounded-pill transition-transform duration-300 shadow-sm"
        style={{
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
          transform: mode === "register" ? "translateX(100%)" : "translateX(0)",
        }}
      />
      <button type="button" onClick={() => onChange("login")}
        className={cn("relative z-10 flex-1 text-sm font-medium rounded-pill transition-colors duration-300",
          mode === "login" ? "text-bg" : "text-ink-muted hover:text-ink")}>
        {t.auth.signIn}
      </button>
      <button type="button" onClick={() => onChange("register")}
        className={cn("relative z-10 flex-1 text-sm font-medium rounded-pill transition-colors duration-300",
          mode === "register" ? "text-bg" : "text-ink-muted hover:text-ink")}>
        {t.auth.createAccount}
      </button>
    </div>
  )
}
