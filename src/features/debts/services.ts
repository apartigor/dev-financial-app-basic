import { buildReminderDates, addByRule } from "@/shared/lib/date"
import type { DebtRow } from "./types"
import type { DebtInput } from "./schemas"

interface ReminderEntry {
  remind_on: string
  kind: "preset" | "custom"
  days_before: number | null
}

export function buildReminders(
  dueDate: string,
  reminderDays: number[],
  customReminders: string[]
): ReminderEntry[] {
  const presetDates = buildReminderDates(dueDate, reminderDays)
  const map = new Map<string, ReminderEntry>()

  presetDates.forEach((date, i) => {
    map.set(date, { remind_on: date, kind: "preset", days_before: reminderDays[i] ?? null })
  })
  customReminders.forEach((date) => {
    map.set(date, { remind_on: date, kind: "custom", days_before: null })
  })

  return Array.from(map.values()).filter((r) => r.remind_on <= dueDate)
}

export function nextOccurrence(debt: DebtRow, input: DebtInput) {
  if (debt.recurrence_rule === "none") return null
  const nextDue = addByRule(debt.due_date, debt.recurrence_rule)
  return { ...input, dueDate: nextDue, parentDebtId: debt.id }
}
