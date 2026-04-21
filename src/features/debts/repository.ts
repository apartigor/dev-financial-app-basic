import "server-only"
import { createClient } from "@/shared/lib/supabase/server"
import type { DebtWithTotals, DebtItemRow } from "./types"

export async function getHouseholdId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .limit(1)
    .single()
  return (data as { household_id: string } | null)?.household_id ?? null
}

export async function listDebts(): Promise<DebtWithTotals[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("debts_with_totals")
    .select("*")
    .order("due_date", { ascending: true })
  return (data ?? []) as DebtWithTotals[]
}

export async function getDebt(id: string): Promise<DebtWithTotals | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("debts_with_totals")
    .select("*")
    .eq("id", id)
    .single()
  return data as DebtWithTotals | null
}

export async function getDebtItems(debtId: string): Promise<DebtItemRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("debt_items")
    .select("*")
    .eq("debt_id", debtId)
    .order("created_at", { ascending: true })
  return (data ?? []) as DebtItemRow[]
}

export async function getDebtReminders(debtId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("debt_reminders")
    .select("*")
    .eq("debt_id", debtId)
    .order("remind_on", { ascending: true })
  return (data ?? []) as Array<{
    id: string; debt_id: string; household_id: string
    remind_on: string; kind: string; days_before: number | null; created_at: string
  }>
}
