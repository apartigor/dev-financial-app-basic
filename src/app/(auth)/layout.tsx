"use client"
import { BrandMark } from "@/features/auth/components/brand-mark"
import { useLanguage } from "@/shared/lib/i18n/provider"
import { LangFlagSwitcher } from "@/shared/ui/lang-flag-switcher"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t, lang } = useLanguage()
  const italicWord = lang === "en" ? "Reminders" : "Lembretes"
  const [before, after] = (t.auth.tagline ?? "").split(italicWord)

  return (
    <div className="min-h-screen bg-bg">
      <div className="md:hidden min-h-screen relative">
        <LangFlagSwitcher className="absolute top-4 right-4 z-10" />
        {children}
      </div>

      <div className="hidden md:flex min-h-screen">
        <div className="w-1/2 bg-surface-alt flex flex-col justify-between px-12 py-14">
          <BrandMark size="md" />
          <div>
            <h2 className="font-serif text-[40px] leading-[1.05] tracking-[-0.6px] text-ink max-w-[360px]">
              {before}<em className="text-accent not-italic">{italicWord}</em>{after}
            </h2>
            <p className="mt-4 text-sm text-ink-muted max-w-[340px]">{t.auth.taglineSub}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-faint tracking-[0.6px] uppercase">{t.auth.pwa}</p>
            <LangFlagSwitcher />
          </div>
        </div>
        <div className="w-1/2 flex items-center justify-center px-12 py-14">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
