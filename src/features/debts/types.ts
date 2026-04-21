export type DebtStatus = "pending" | "overdue" | "paid" | "empty"
export type Direction  = "payable" | "receivable"

export interface DebtRow {
  id: string; household_id: string; created_by: string
  title: string; direction: Direction; currency: string; due_date: string
  notes: string | null; recurrence_rule: "none" | "monthly" | "weekly" | "yearly"
  parent_debt_id: string | null; created_at: string; updated_at: string
}

export interface DebtItemRow {
  id: string; debt_id: string; household_id: string
  label: string; amount_cents: number; paid: boolean; paid_at: string | null
  created_at: string; updated_at: string
}

export interface DebtWithTotals extends DebtRow {
  total_cents: number; paid_cents: number
  items_count: number; items_paid_count: number
  status: DebtStatus
}
