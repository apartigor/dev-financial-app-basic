"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Chip } from "@/shared/ui/chip"
import { DebtRow } from "@/shared/ui/debt-row"
import { formatBRL } from "@/shared/lib/money"
import { daysUntilDue } from "@/shared/lib/date"
import type { DebtWithTotals } from "../types"

type Filter = "all" | "pending" | "overdue" | "paid"
type Group = "Atrasadas" | "Hoje" | "Esta semana" | "Este mês" | "Mais tarde" | "Pagas"

const GROUP_ORDER: Group[] = ["Atrasadas", "Hoje", "Esta semana", "Este mês", "Mais tarde", "Pagas"]

function getGroup(debt: DebtWithTotals): Group {
  if (debt.status === "paid") return "Pagas"
  if (debt.status === "overdue") return "Atrasadas"
  const days = daysUntilDue(debt.due_date)
  if (days === 0) return "Hoje"
  if (days <= 7) return "Esta semana"
  if (days <= 30) return "Este mês"
  return "Mais tarde"
}

interface Props {
  debts: DebtWithTotals[]
}

export function DebtListClient({ debts }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>("all")

  const counts = {
    all:     debts.length,
    pending: debts.filter((d) => d.status === "pending").length,
    overdue: debts.filter((d) => d.status === "overdue").length,
    paid:    debts.filter((d) => d.status === "paid").length,
  }

  const filtered = debts.filter((d) => {
    if (filter === "all")     return true
    if (filter === "pending") return d.status === "pending"
    if (filter === "overdue") return d.status === "overdue"
    if (filter === "paid")    return d.status === "paid"
    return true
  })

  const groups = new Map<Group, DebtWithTotals[]>()
  ;[...filtered]
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .forEach((d) => {
      const g = getGroup(d)
      if (!groups.has(g)) groups.set(g, [])
      groups.get(g)!.push(d)
    })

  if (debts.length === 0) {
    return (
      <p className="text-sm text-ink-faint text-center py-12">
        Nenhuma dívida ainda. Que alívio.
      </p>
    )
  }

  return (
    <>
      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {(["all", "pending", "overdue", "paid"] as Filter[]).map((f) => (
          <Chip
            key={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Todas" : f === "pending" ? "Pendentes" : f === "overdue" ? "Atrasadas" : "Pagas"}
            <span className="opacity-60 ml-0.5 tabular-nums">{counts[f]}</span>
          </Chip>
        ))}
      </div>

      {/* Groups */}
      {GROUP_ORDER.map((group) => {
        const items = groups.get(group)
        if (!items) return null
        const sumCents = items.reduce((s, d) => s + Number(d.total_cents) - Number(d.paid_cents), 0)

        return (
          <div key={group} className="mb-5">
            <div className="flex items-baseline justify-between mb-2 px-0.5">
              <span className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px]">
                {group}
                <span className="ml-2 text-ink-faint">{items.length}</span>
              </span>
              <span className="text-xs text-ink-faint tabular-nums">{formatBRL(sumCents)}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((d) => (
                <DebtRow
                  key={d.id}
                  debt={{
                    id: d.id,
                    title: d.title,
                    totalCents: Number(d.total_cents),
                    paidCents: Number(d.paid_cents),
                    dueDate: d.due_date,
                    status: d.status as "pending" | "overdue" | "paid" | "empty",
                    recurrenceRule: d.recurrence_rule,
                    itemsCount: Number(d.items_count),
                    itemsPaidCount: Number(d.items_paid_count),
                    direction: d.direction as "payable" | "receivable",
                  }}
                  onClick={() => router.push(`/debts/${d.id}`)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
