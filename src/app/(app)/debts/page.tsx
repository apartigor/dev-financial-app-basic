import { AppShell } from "@/shared/ui/app-shell"
import { DebtListClient } from "@/features/debts/components/debt-list-client"
import { listDebts } from "@/features/debts/repository"

export default async function DebtsPage() {
  const debts = await listDebts()
  return (
    <AppShell titleKey="debts">
      <DebtListClient debts={debts} />
    </AppShell>
  )
}
