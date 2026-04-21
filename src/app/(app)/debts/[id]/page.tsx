import { notFound } from "next/navigation"
import { AppShell } from "@/shared/ui/app-shell"
import { DebtDetailClient } from "@/features/debts/components/debt-detail-client"
import { getDebt, getDebtItems, getDebtReminders } from "@/features/debts/repository"

interface Props {
  params: Promise<{ id: string }>
}

export default async function DebtDetailPage({ params }: Props) {
  const { id } = await params
  const [debt, items, reminders] = await Promise.all([
    getDebt(id),
    getDebtItems(id),
    getDebtReminders(id),
  ])

  if (!debt) notFound()

  return (
    <AppShell title={debt.title} subtitle="Detalhe">
      <DebtDetailClient debt={debt} items={items} reminders={reminders} />
    </AppShell>
  )
}
