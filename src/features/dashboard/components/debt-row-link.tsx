"use client"
import { useRouter } from "next/navigation"
import { DebtRow, type DebtRowData } from "@/shared/ui/debt-row"

export function DebtRowLink({ debt }: { debt: DebtRowData }) {
  const router = useRouter()
  return (
    <DebtRow
      debt={debt}
      onClick={() => router.push(`/debts/${debt.id}`)}
    />
  )
}
