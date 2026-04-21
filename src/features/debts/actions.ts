"use server"
import { revalidatePath } from "next/cache"
import { createClient } from "@/shared/lib/supabase/server"
import { getUser } from "@/shared/lib/supabase/server"
import { debtSchema } from "./schemas"
import { buildReminders } from "./services"
import { getHouseholdId } from "./repository"
import type { DebtInput } from "./schemas"

export async function createDebt(input: DebtInput): Promise<{ error?: string; id?: string }> {
  const parsed = debtSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const [user, householdId] = await Promise.all([getUser(), getHouseholdId()])
  if (!user || !householdId) return { error: "Não autenticado." }

  const supabase = await createClient()
  const d = parsed.data

  const { data: debt, error } = await supabase
    .from("debts")
    .insert({
      household_id: householdId, created_by: user.id,
      title: d.title, direction: d.direction,
      due_date: d.dueDate, notes: d.notes?.trim() || null,
      recurrence_rule: d.recurrenceRule,
    })
    .select("id")
    .single()

  if (error || !debt) return { error: "Erro ao salvar dívida." }
  const debtId = (debt as { id: string }).id

  const itemsToInsert = d.items.length > 0
    ? d.items.map((item) => ({
        debt_id: debtId, household_id: householdId,
        label: item.label, amount_cents: item.amountCents,
      }))
    : [{ debt_id: debtId, household_id: householdId, label: d.title, amount_cents: d.totalCents }]

  await supabase.from("debt_items").insert(itemsToInsert)

  const reminders = buildReminders(d.dueDate, d.reminderDays, d.customReminders)
  if (reminders.length > 0) {
    await supabase.from("debt_reminders").insert(
      reminders.map((r) => ({ ...r, debt_id: debtId, household_id: householdId }))
    )
  }

  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return { id: debtId }
}

export async function updateDebt(id: string, input: DebtInput): Promise<{ error?: string }> {
  const parsed = debtSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }

  const householdId = await getHouseholdId()
  if (!householdId) return { error: "Não autenticado." }

  const supabase = await createClient()
  const d = parsed.data

  const { error } = await supabase.from("debts").update({
    title: d.title, direction: d.direction, due_date: d.dueDate,
    notes: d.notes?.trim() || null, recurrence_rule: d.recurrenceRule,
  }).eq("id", id)

  if (error) return { error: "Erro ao atualizar." }

  await supabase.from("debt_items").delete().eq("debt_id", id)
  const itemsToInsert = d.items.length > 0
    ? d.items.map((item) => ({
        debt_id: id, household_id: householdId,
        label: item.label, amount_cents: item.amountCents,
      }))
    : [{ debt_id: id, household_id: householdId, label: d.title, amount_cents: d.totalCents }]
  await supabase.from("debt_items").insert(itemsToInsert)

  await supabase.from("debt_reminders").delete().eq("debt_id", id)
  const reminders = buildReminders(d.dueDate, d.reminderDays, d.customReminders)
  if (reminders.length > 0) {
    await supabase.from("debt_reminders").insert(
      reminders.map((r) => ({ ...r, debt_id: id, household_id: householdId }))
    )
  }

  revalidatePath("/debts")
  revalidatePath(`/debts/${id}`)
  revalidatePath("/dashboard")
  return {}
}

export async function deleteDebt(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("debts").delete().eq("id", id)
  if (error) return { error: "Erro ao excluir." }
  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return {}
}

export async function toggleDebtItem(itemId: string, paid: boolean): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from("debt_items").update({ paid }).eq("id", itemId)
  if (error) return { error: "Erro ao atualizar item." }
  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return {}
}

export async function markDebtPaid(debtId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  await supabase.from("debt_items").update({ paid: true }).eq("debt_id", debtId)
  revalidatePath("/debts")
  revalidatePath(`/debts/${debtId}`)
  revalidatePath("/dashboard")
  return {}
}
