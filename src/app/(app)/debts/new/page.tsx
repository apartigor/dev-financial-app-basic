import { AppShell } from "@/shared/ui/app-shell"
import { DebtForm } from "@/features/debts/components/debt-form"

export default function NewDebtPage() {
  return (
    <AppShell titleKey="newDebt">
      <DebtForm />
    </AppShell>
  )
}
