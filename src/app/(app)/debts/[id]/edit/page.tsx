import { notFound } from "next/navigation"
import { AppShell } from "@/shared/ui/app-shell"
import { DebtForm } from "@/features/debts/components/debt-form"
import { getDebt, getDebtItems, getDebtReminders } from "@/features/debts/repository"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditDebtPage({ params }: Props) {
  const { id } = await params
  const [debt, items, reminders] = await Promise.all([
    getDebt(id),
    getDebtItems(id),
    getDebtReminders(id),
  ])

  if (!debt) notFound()

  const totalCents = items.reduce((s, i) => s + Number(i.amount_cents), 0)
  const isSimple   = items.length === 1 && items[0]?.label === debt.title

  const defaultValues = {
    title:           debt.title,
    direction:       debt.direction as "payable" | "receivable",
    totalCents,
    dueDate:         debt.due_date,
    notes:           debt.notes ?? "",
    recurrenceRule:  debt.recurrence_rule as "none" | "monthly" | "weekly" | "yearly",
    items:           isSimple
      ? []
      : items.map((i) => ({ id: i.id, label: i.label, amountCents: Number(i.amount_cents) })),
    reminderDays:    reminders.filter((r) => r.days_before !== null).map((r) => r.days_before!),
    customReminders: reminders.filter((r) => r.kind === "custom").map((r) => r.remind_on),
  }

  return (
    <AppShell title="Editar" subtitle="Dívida">
      <DebtForm defaultValues={defaultValues} debtId={id} />
    </AppShell>
  )
}
