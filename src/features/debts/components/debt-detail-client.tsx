"use client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Edit2, Check, Bell, Handshake } from "lucide-react"
import { Money } from "@/shared/ui/money"
import { StatusDot } from "@/shared/ui/status-dot"
import { StatusLabel } from "@/shared/ui/status-label"
import { ProgressBar } from "@/shared/ui/progress-bar"
import { Checkbox } from "@/shared/ui/checkbox"
import { Button } from "@/shared/ui/button"
import { Chip } from "@/shared/ui/chip"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { daysUntilDue, formatDateBR } from "@/shared/lib/date"
import { toggleDebtItem, markDebtPaid, deleteDebt } from "../actions"
import type { DebtWithTotals, DebtItemRow } from "../types"

interface Reminder {
  id: string
  remind_on: string
  days_before: number | null
  kind: string
}

interface Props {
  debt: DebtWithTotals
  items: DebtItemRow[]
  reminders: Reminder[]
}

export function DebtDetailClient({ debt, items, reminders }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [localItems, setLocalItems] = useState(items)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const days = daysUntilDue(debt.due_date)
  const totalCents    = Number(debt.total_cents)
  const paidCents     = localItems.filter((i) => i.paid).reduce((s, i) => s + Number(i.amount_cents), 0)
  const progress      = totalCents > 0 ? paidCents / totalCents : 0
  const allItemsPaid  = localItems.length > 0 && localItems.every((i) => i.paid)
  const isPaid        = allItemsPaid || debt.status === "paid"
  const showProgress  = localItems.length > 1 || isPaid
  const localStatus: "pending" | "overdue" | "paid" | "empty" =
    isPaid ? "paid" :
    debt.status === "overdue" ? "overdue" :
    debt.status as "pending" | "overdue" | "paid" | "empty"
  const progressTone  = progress === 1 ? "paid" : localStatus === "overdue" ? "warn" : "accent"

  function handleToggleItem(itemId: string) {
    if (isPaid) return
    const item = localItems.find((i) => i.id === itemId)
    if (!item) return
    const newPaid = !item.paid
    setLocalItems((prev) => prev.map((i) => i.id === itemId ? { ...i, paid: newPaid } : i))
    startTransition(async () => {
      await toggleDebtItem(itemId, newPaid)
    })
  }

  function handleMarkPaid() {
    // optimistic: mark all items as paid locally
    setLocalItems((prev) => prev.map((i) => ({ ...i, paid: true, paid_at: new Date().toISOString() })))
    startTransition(async () => {
      await markDebtPaid(debt.id)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteDebt(debt.id)
      router.push("/debts")
    })
  }

  function formatReminderLabel(r: Reminder): string {
    if (r.days_before === 0) return "No dia do vencimento"
    if (r.days_before) return `${r.days_before} dia${r.days_before === 1 ? "" : "s"} antes`
    return "Data específica"
  }

  return (
    <div className="pb-8">
      {/* Hero card */}
      <div className="bg-surface border border-hairline rounded-lg p-[22px] mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <StatusDot status={localStatus} />
          <StatusLabel status={localStatus} days={days} />
          {debt.recurrence_rule !== "none" && (
            <Chip size="sm" tone="accent">Mensal</Chip>
          )}
          <Chip size="sm" tone={debt.direction === "payable" ? "warn" : "accent"}>
            {debt.direction === "payable" ? "A pagar" : "A receber"}
          </Chip>
        </div>
        <p className="text-lg font-medium mb-3">{debt.title}</p>
        <Money cents={totalCents} size={46} tone={isPaid ? "paid" : "default"} />

        <div className="flex gap-5 mt-4 pt-3.5 border-t border-dashed border-hairline">
          <div className="flex-1">
            <p className="text-[11px] text-ink-muted mb-0.5 tracking-[0.3px]">Vencimento</p>
            <p className="text-sm font-medium">{formatDateBR(debt.due_date)}</p>
          </div>
          <div className="w-px bg-hairline" />
          <div className="flex-1">
            <p className="text-[11px] text-ink-muted mb-0.5 tracking-[0.3px]">Criada em</p>
            <p className="text-sm font-medium">{formatDateBR(debt.created_at.slice(0, 10))}</p>
          </div>
        </div>

        {showProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-muted">Recebido</span>
              <span className="text-ink tabular-nums">
                R$ {(paidCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{" "}
                <span className="text-ink-faint">de R$ {(totalCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </span>
            </div>
            <ProgressBar value={progress} tone={progressTone} height={8} />
          </div>
        )}
      </div>

      {/* Items / Cobranças */}
      {localItems.length > 1 && (
        <div className="bg-surface border border-hairline rounded-md p-[18px] mb-4">
          <div className="flex items-center gap-2 mb-3.5">
            <Handshake size={16} className="text-accent" />
            <span className="text-sm font-medium">Cobranças</span>
          </div>
          <div className="flex flex-col">
            {localItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-hairline last:border-0">
                <Checkbox
                  checked={item.paid}
                  onChange={() => handleToggleItem(item.id)}
                  disabled={isPaid}
                />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.paid ? "line-through text-ink-muted" : "text-ink"}`}>
                    {item.label}
                  </p>
                  {item.paid && <p className="text-[11px] text-paid mt-0.5">Pago</p>}
                </div>
                <Money cents={Number(item.amount_cents)} size={16} tone={item.paid ? "paid" : "default"} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="bg-surface border border-hairline rounded-md p-[18px] mb-4">
          <div className="flex items-center gap-2 mb-3.5">
            <Bell size={16} className="text-accent" />
            <span className="text-sm font-medium">Lembretes</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <span className="flex-1 text-[13px]">{formatReminderLabel(r)}</span>
                <span className="text-xs text-ink-faint">{formatDateBR(r.remind_on)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {debt.notes && (
        <div className="bg-surface border border-hairline rounded-md p-[18px] mb-4">
          <p className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px] mb-2">Notas</p>
          <p className="text-sm text-ink-muted leading-relaxed">{debt.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 mt-5">
        <Button
          variant="secondary"
          onClick={() => router.push(`/debts/${debt.id}/edit`)}
          className="flex-1"
        >
          <Edit2 size={14} /> Editar
        </Button>
        {!isPaid && (
          <Button variant="accent" onClick={handleMarkPaid} disabled={pending} style={{ flex: 2 }}>
            <Check size={16} strokeWidth={2.5} /> Marcar como paga
          </Button>
        )}
      </div>

      <button
        onClick={() => setConfirmDeleteOpen(true)}
        disabled={pending}
        className="mt-3.5 w-full py-2.5 text-[13px] text-warn bg-transparent border-none cursor-pointer hover:underline underline-offset-4 disabled:opacity-50"
      >
        Excluir dívida
      </button>

      <ConfirmDialog
        open={confirmDeleteOpen}
        tone="warn"
        title="Excluir esta dívida?"
        description={`"${debt.title}" será removida permanentemente. Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Manter"
        loading={pending}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
