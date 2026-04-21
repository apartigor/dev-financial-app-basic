"use client"
import { useLanguage } from "@/shared/lib/i18n/provider"
import { cn } from "@/shared/lib/cn"
import type { Lang } from "@/shared/lib/i18n/translations"

export function LangFlagSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {(["pt", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-label={l === "pt" ? "Português" : "English"}
          className={cn(
            "text-lg leading-none rounded-sm px-1 py-0.5 transition-all",
            lang === l ? "opacity-100 scale-110" : "opacity-40 hover:opacity-70"
          )}
        >
          {l === "pt" ? "🇧🇷" : "🇺🇸"}
        </button>
      ))}
    </div>
  )
}
