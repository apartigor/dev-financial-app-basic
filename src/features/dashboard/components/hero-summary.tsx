import { Money } from "@/shared/ui/money"

interface HeroSummaryProps {
  totalPayableCents: number
  totalReceivableCents: number
  pendingCount: number
  overdueCount: number
}

export function HeroSummary({ totalPayableCents, totalReceivableCents, pendingCount, overdueCount }: HeroSummaryProps) {
  const totalCents = totalPayableCents + totalReceivableCents

  return (
    <div className="bg-surface border border-hairline rounded-lg p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <p className="text-[11px] font-medium text-ink-muted uppercase tracking-[0.8px]">
        A pagar este mês
      </p>
      <div className="mt-2">
        <Money cents={totalCents} size={42} />
      </div>

      <div className="flex gap-4 mt-4 pt-3.5 border-t border-dashed border-hairline">
        <div className="flex-1">
          <p className="text-[11px] text-ink-muted mb-0.5 tracking-[0.3px]">Pendentes</p>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-[22px]">{pendingCount}</span>
            <span className="text-xs text-ink-faint">dívidas</span>
          </div>
        </div>
        <div className="w-px bg-hairline" />
        <div className="flex-1">
          <p className="text-[11px] text-ink-muted mb-0.5 tracking-[0.3px]">Atrasadas</p>
          <Money cents={overdueCount > 0 ? totalPayableCents : 0} size={20} tone={overdueCount > 0 ? "warn" : "muted"} />
        </div>
      </div>
    </div>
  )
}
