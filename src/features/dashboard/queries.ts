import "server-only"
import { createClient } from "@/shared/lib/supabase/server"
import { toISODate, todayBRT } from "@/shared/lib/date"
import { addDays } from "date-fns"
import type { DebtWithTotals } from "@/features/debts/types"

export interface DashboardSummary {
  totalPayableCents: number
  totalReceivableCents: number
  pendingCount: number
  overdueCount: number
  upcomingWeekCount: number
}

export interface CalendarDay {
  date: string
  isToday: boolean
  debtCount: number
  debtIds: string[]
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("debts_with_totals")
    .select("status, direction, total_cents, paid_cents, due_date")

  const today = toISODate(todayBRT())
  const in7   = toISODate(addDays(todayBRT(), 7))

  let totalPayableCents = 0, totalReceivableCents = 0
  let pendingCount = 0, overdueCount = 0, upcomingWeekCount = 0

  for (const d of (data ?? []) as DebtWithTotals[]) {
    if (d.status === "paid") continue
    const pending = Number(d.total_cents) - Number(d.paid_cents)
    if (d.direction === "payable")    totalPayableCents    += pending
    if (d.direction === "receivable") totalReceivableCents += pending
    if (d.status === "pending") {
      pendingCount++
      if (d.due_date >= today && d.due_date <= in7) upcomingWeekCount++
    }
    if (d.status === "overdue") overdueCount++
  }

  return { totalPayableCents, totalReceivableCents, pendingCount, overdueCount, upcomingWeekCount }
}

export async function getUpcomingDebts(limit = 5): Promise<DebtWithTotals[]> {
  const supabase = await createClient()
  const today = toISODate(todayBRT())
  const { data } = await supabase
    .from("debts_with_totals")
    .select("*")
    .neq("status", "paid")
    .gte("due_date", today)
    .order("due_date", { ascending: true })
    .limit(limit)
  return (data ?? []) as DebtWithTotals[]
}

export async function getCalendarDays(): Promise<CalendarDay[]> {
  const supabase = await createClient()
  const today = todayBRT()
  const start = toISODate(today)
  const end   = toISODate(addDays(today, 13))

  const { data } = await supabase
    .from("debts_with_totals")
    .select("id, due_date, status")
    .neq("status", "paid")
    .gte("due_date", start)
    .lte("due_date", end)

  const dayMap = new Map<string, string[]>()
  for (const d of (data ?? []) as { id: string; due_date: string }[]) {
    const arr = dayMap.get(d.due_date) ?? []
    arr.push(d.id)
    dayMap.set(d.due_date, arr)
  }

  const days: CalendarDay[] = []
  for (let i = 0; i < 14; i++) {
    const date = toISODate(addDays(today, i))
    const ids = dayMap.get(date) ?? []
    days.push({ date, isToday: i === 0, debtCount: ids.length, debtIds: ids })
  }
  return days
}
