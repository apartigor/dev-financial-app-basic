import { cn } from "@/shared/lib/cn"
import { splitCents } from "@/shared/lib/money"

type MoneyTone = "default" | "muted" | "warn" | "paid"

const toneClass: Record<MoneyTone, string> = {
  default: "text-ink",
  muted:   "text-ink-muted",
  warn:    "text-warn",
  paid:    "text-paid",
}

interface MoneyProps {
  /** Value in cents. E.g. 19000 = R$ 190,00 */
  cents: number
  size?: number
  tone?: MoneyTone
  className?: string
}

/**
 * Signature component — always rendered in Instrument Serif.
 * Prefix R$ is 55% of size, integer part 100%, decimal 60%.
 */
export function Money({ cents, size = 20, tone = "default", className }: MoneyProps) {
  const { whole, decimal } = splitCents(cents)

  return (
    <span
      className={cn("font-serif inline-flex items-baseline tracking-tight", toneClass[tone], className)}
      style={{ gap: 2 }}
    >
      <span style={{ fontSize: size * 0.55, opacity: 0.6, lineHeight: 1 }}>R$</span>
      <span style={{ fontSize: size, lineHeight: 1 }}>{whole}</span>
      <span style={{ fontSize: size * 0.6, opacity: 0.5 }}>,{decimal}</span>
    </span>
  )
}
