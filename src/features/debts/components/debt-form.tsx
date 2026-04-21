"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Bell, Handshake, Plus, X, Check } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { TextField } from "@/shared/ui/text-field"
import { Checkbox } from "@/shared/ui/checkbox"
import { DatePicker } from "@/shared/ui/date-picker"
import { cn } from "@/shared/lib/cn"
import { formatBRL } from "@/shared/lib/money"
import { formatDateBR } from "@/shared/lib/date"
import { useLanguage } from "@/shared/lib/i18n/provider"
import { debtSchema } from "../schemas"
import { createDebt, updateDebt } from "../actions"
import { MiniCalendar } from "./mini-calendar"
import type { DebtInput } from "../schemas"

const PRESET_DAYS = [7, 3, 1, 0] as const
const PRESET_LABELS_PT: Record<number, string> = { 7: "7 dias antes", 3: "3 dias antes", 1: "1 dia antes", 0: "No dia" }
const PRESET_LABELS_EN: Record<number, string> = { 7: "7 days before", 3: "3 days before", 1: "1 day before", 0: "On the day" }

function getPresetSubLabel(dueDate: string, daysBefore: number): string {
  if (!dueDate) return ""
  try {
    const [y, m, d] = dueDate.split("-").map(Number)
    const due = new Date(y!, m! - 1, d!)
    due.setDate(due.getDate() - daysBefore)
    return due.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
      .replace(".", "").replace("-feira", "")
  } catch { return "" }
}

interface DebtFormProps {
  defaultValues?: Partial<DebtInput>
  debtId?: string
}

function SplitAmountInput({ initialCents, onChange }: { initialCents: number; onChange: (c: number) => void }) {
  const [display, setDisplay] = useState(
    initialCents > 0 ? (initialCents / 100).toFixed(2).replace(".", ",") : ""
  )
  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder="0,00"
      value={display}
      onChange={(e) => {
        setDisplay(e.target.value)
        const raw = e.target.value.replace(",", ".")
        const parsed = parseFloat(raw)
        onChange(isNaN(parsed) ? 0 : Math.round(parsed * 100))
      }}
      onBlur={(e) => {
        const raw = e.target.value.replace(",", ".")
        const parsed = parseFloat(raw)
        if (!isNaN(parsed) && parsed > 0) {
          const cents = Math.round(parsed * 100)
          setDisplay((cents / 100).toFixed(2).replace(".", ","))
          onChange(cents)
        } else {
          setDisplay("")
          onChange(0)
        }
      }}
      className="w-20 bg-transparent text-sm text-ink font-sans outline-none border-none"
    />
  )
}

export function DebtForm({ defaultValues, debtId }: DebtFormProps) {
  const router = useRouter()
  const { lang } = useLanguage()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [customPickerOpen, setCustomPickerOpen] = useState(false)
  const initCents = defaultValues?.totalCents ?? 0
  const [totalDisplay, setTotalDisplay] = useState(
    initCents > 0 ? (initCents / 100).toFixed(2).replace(".", ",") : ""
  )

  const form = useForm<DebtInput>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      title: "",
      direction: "payable",
      totalCents: 0,
      dueDate: "",
      notes: "",
      recurrenceRule: "none",
      items: [],
      reminderDays: [7, 3, 1, 0],
      customReminders: [],
      ...defaultValues,
    },
  })

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control, name: "items",
  })

  const dueDate = form.watch("dueDate")
  const direction = form.watch("direction")
  const reminderDays = form.watch("reminderDays")
  const customReminders = form.watch("customReminders")
  const totalCents = form.watch("totalCents")
  const items = form.watch("items")

  // Which preset reminder days are still in the future (reminder date >= today)
  const todayISO = new Date().toISOString().slice(0, 10)
  function isPresetEnabled(daysBefore: number): boolean {
    if (!dueDate) return true
    const [y, m, d] = dueDate.split("-").map(Number)
    const reminderDate = new Date(y!, m! - 1, d!)
    reminderDate.setDate(reminderDate.getDate() - daysBefore)
    return reminderDate.toISOString().slice(0, 10) >= todayISO
  }

  const itemsSum    = items.reduce((s, i) => s + (Number(i.amountCents) || 0), 0)
  const remaining   = totalCents - itemsSum
  const hasSplits   = itemFields.length > 0
  const hasZeroItem  = hasSplits && items.some((i) => (Number(i.amountCents) || 0) === 0)
  const splitInvalid = hasSplits && (remaining !== 0 || hasZeroItem)

  function toggleReminderDay(day: number) {
    const current = form.getValues("reminderDays")
    if (current.includes(day)) {
      form.setValue("reminderDays", current.filter((d) => d !== day))
    } else {
      form.setValue("reminderDays", [...current, day].sort((a, b) => b - a))
    }
  }

  function addCustomReminder(dates: string[]) {
    if (!dueDate) return
    const [y, m, d] = dueDate.split("-").map(Number)

    // For each picked date, check if it matches a disabled preset
    const presetDaysToAdd: number[] = []
    const trulyCustom: string[] = []

    for (const date of dates) {
      let matchedPreset: number | null = null
      for (const presetDay of PRESET_DAYS) {
        const presetDate = new Date(y!, m! - 1, d!)
        presetDate.setDate(presetDate.getDate() - presetDay)
        const presetISO = `${presetDate.getFullYear()}-${String(presetDate.getMonth() + 1).padStart(2, "0")}-${String(presetDate.getDate()).padStart(2, "0")}`
        if (presetISO === date) {
          matchedPreset = presetDay
          break
        }
      }
      if (matchedPreset !== null) {
        presetDaysToAdd.push(matchedPreset)
      } else {
        trulyCustom.push(date)
      }
    }

    // Enable matched presets
    if (presetDaysToAdd.length > 0) {
      const currentDays = form.getValues("reminderDays")
      const merged = [...new Set([...currentDays, ...presetDaysToAdd])].sort((a, b) => b - a)
      form.setValue("reminderDays", merged)
    }

    // Replace customReminders with the full selection from the calendar
    form.setValue("customReminders", [...new Set(trulyCustom)].sort())

    setCustomPickerOpen(false)
  }

  function addSplit() {
    // New participant gets remainder (if positive) by default
    const suggested = Math.max(0, remaining)
    appendItem({ label: "", amountCents: suggested })
  }

  async function onSubmit(data: DebtInput) {
    setError(undefined)
    setLoading(true)
    try {
      const result = debtId
        ? await updateDebt(debtId, data)
        : await createDebt(data)
      if (result.error) {
        setError(result.error)
      } else if (!debtId && "id" in result && result.id) {
        router.push(`/debts/${result.id}`)
      } else {
        router.push(`/debts/${debtId}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Title */}
      <TextField
        label={lang === "en" ? "Title" : "Título"}
        placeholder={lang === "en" ? "e.g. Rent, BBQ party" : "Ex. Aluguel, Churrasco"}
        {...form.register("title")}
        error={form.formState.errors.title?.message}
        className="mb-4"
      />

      {/* Direction */}
      <div className="mb-4">
        <label className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px] mb-2 block">
          {lang === "en" ? "Type" : "Tipo"}
        </label>
        <div className="flex gap-2">
          {(["payable", "receivable"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => form.setValue("direction", d)}
              className={cn(
                "flex-1 h-[42px] rounded-sm border text-sm font-medium transition-colors",
                direction === d
                  ? "bg-ink text-bg border-transparent"
                  : "bg-surface text-ink border-hairline-strong"
              )}
            >
              {d === "payable"
                ? (lang === "en" ? "To pay" : "A pagar")
                : (lang === "en" ? "To receive" : "A receber")}
            </button>
          ))}
        </div>
      </div>

      {/* Total + Date */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div>
          <label className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px] mb-2 block">
            {lang === "en" ? "Total amount" : "Valor total"}
          </label>
          <div className={cn(
            "flex items-center bg-surface border rounded-sm px-3.5 h-[46px]",
            form.formState.errors.totalCents ? "border-warn" : "border-hairline"
          )}>
            <span className="text-ink-faint mr-2 text-base flex-shrink-0">R$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={totalDisplay}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".")
                setTotalDisplay(e.target.value)
                const parsed = parseFloat(raw)
                const cents = isNaN(parsed) ? 0 : Math.round(parsed * 100)
                form.setValue("totalCents", cents, { shouldValidate: false })
              }}
              onBlur={(e) => {
                const raw = e.target.value.replace(",", ".")
                const parsed = parseFloat(raw)
                if (!isNaN(parsed) && parsed > 0) {
                  const cents = Math.round(parsed * 100)
                  setTotalDisplay((cents / 100).toFixed(2).replace(".", ","))
                  form.setValue("totalCents", cents, { shouldValidate: true })
                } else {
                  setTotalDisplay("")
                  form.setValue("totalCents", 0, { shouldValidate: true })
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-ink text-base font-sans w-full"
            />
          </div>
          {form.formState.errors.totalCents && (
            <p className="mt-1.5 text-xs text-warn">{form.formState.errors.totalCents.message}</p>
          )}
        </div>

        <DatePicker
          label={lang === "en" ? "Due date" : "Vencimento"}
          value={dueDate}
          onChange={(iso) => {
            form.setValue("dueDate", iso, { shouldValidate: true })
            const current = form.getValues("reminderDays")
            const valid = current.filter((d) => {
              const [y, m, day] = iso.split("-").map(Number)
              const reminderDate = new Date(y!, m! - 1, day!)
              reminderDate.setDate(reminderDate.getDate() - d)
              return reminderDate.toISOString().slice(0, 10) >= new Date().toISOString().slice(0, 10)
            })
            form.setValue("reminderDays", valid)
          }}
          error={form.formState.errors.dueDate?.message}
          minDate={new Date().toISOString().slice(0, 10)}
        />
      </div>

      {/* Reminder card */}
      <div className="bg-surface border border-hairline rounded-md p-[18px] mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-accent" />
          <span className="text-sm font-medium">{lang === "en" ? "Remind me" : "Me lembre"}</span>
        </div>
        <p className="text-[12px] text-ink-faint mb-3.5">
          {lang === "en" ? "When should we notify you?" : "Quando enviar notificação antes do vencimento?"}
        </p>
        <div className="flex flex-col gap-2">
          {PRESET_DAYS.map((d) => {
            const active  = reminderDays.includes(d)
            const enabled = isPresetEnabled(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => enabled && toggleReminderDay(d)}
                disabled={!enabled}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm border transition-colors w-full",
                  !enabled && "opacity-35 cursor-not-allowed",
                  enabled && active   ? "bg-accent-soft border-transparent" : "",
                  enabled && !active  ? "bg-transparent border-hairline" : "",
                  !enabled            ? "bg-transparent border-hairline" : ""
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-[6px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all",
                  active && enabled ? "bg-accent border-accent" : "bg-transparent border-hairline-strong"
                )}>
                  {active && enabled && <Check size={11} strokeWidth={2.5} className="text-white" />}
                </span>
                <span className="flex-1 text-left">
                  <span className={cn("text-sm", active && enabled ? "font-medium text-ink" : "text-ink")}>
                    {(lang === "en" ? PRESET_LABELS_EN : PRESET_LABELS_PT)[d]}
                  </span>
                  {dueDate && (
                    <span className="block text-[11px] text-ink-faint mt-0.5">
                      {enabled ? getPresetSubLabel(dueDate, d) : (lang === "en" ? "Date already passed" : "Data já passou")}
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        {customReminders.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {customReminders.map((date) => (
              <span key={date} className="inline-flex items-center gap-1 bg-accent-soft text-accent text-xs px-2.5 py-1 rounded-pill">
                {formatDateBR(date)}
                <button type="button" onClick={() => form.setValue("customReminders", customReminders.filter((d) => d !== date))}>
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setCustomPickerOpen((o) => !o)}
          disabled={!dueDate}
          className="mt-2.5 w-full border border-dashed border-hairline-strong rounded-sm py-2.5 px-3
            flex items-center gap-2 text-[13px] text-ink-muted bg-transparent
            disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer"
          title={!dueDate ? (lang === "en" ? "Select a due date first" : "Selecione o vencimento primeiro") : undefined}
        >
          <Plus size={14} /> {lang === "en" ? "Add specific date" : "Adicionar data específica"}
        </button>

        {customPickerOpen && (
          <MiniCalendar
            dueDate={dueDate}
            onPick={addCustomReminder}
            initialSelected={customReminders}
            coveredDates={dueDate ? reminderDays.map((d) => {
              const [y, m, day] = dueDate.split("-").map(Number)
              const date = new Date(y!, m! - 1, day!)
              date.setDate(date.getDate() - d)
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
            }) : []}
          />
        )}
      </div>

      {/* Splits */}
      <div className="bg-surface border border-hairline rounded-md p-[18px] mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Handshake size={16} className="text-accent" />
          <span className="text-sm font-medium">{lang === "en" ? "Split between people" : "Dividir entre pessoas"}</span>
          {itemFields.length > 0 && (
            <span className="bg-accent-soft text-accent text-xs px-2 py-0.5 rounded-pill">
              {itemFields.length}
            </span>
          )}
        </div>
        <p className="text-[12px] text-ink-faint mb-3.5">
          {lang === "en" ? "Optional. Split the total among multiple people." : "Opcional. Divida o valor total entre várias pessoas."}
        </p>

        {hasSplits && (
          <div className="flex flex-col gap-2 mb-2.5">
            {itemFields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  placeholder={lang === "en" ? "Name" : "Nome"}
                  {...form.register(`items.${i}.label`)}
                  className="flex-1 h-10 px-3 bg-bg border border-hairline rounded-[8px]
                    text-sm text-ink font-sans outline-none focus:border-hairline-strong transition-colors"
                />
                <div className="flex items-center gap-1 bg-bg border border-hairline rounded-[8px] px-2.5 h-10
                  focus-within:border-hairline-strong transition-colors">
                  <span className="text-xs text-ink-faint">R$</span>
                  <SplitAmountInput
                    initialCents={items[i]?.amountCents ?? 0}
                    onChange={(cents) => form.setValue(`items.${i}.amountCents`, cents, { shouldValidate: true })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="w-8 h-8 flex items-center justify-center text-ink-faint rounded-[6px] hover:bg-surface-alt transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Feedback sobre restante/sobra */}
        {hasSplits && totalCents > 0 && (
          <div className={cn(
            "mb-2 px-3 py-2 rounded-sm text-xs flex items-center justify-between",
            remaining === 0 && !hasZeroItem ? "bg-paid-soft text-paid" :
              remaining === 0 && hasZeroItem ? "bg-warn-soft text-warn border border-warn/30" :
              remaining > 0 ? "bg-accent-soft text-accent" :
                "bg-warn-soft text-warn border border-warn/30"
          )}>
            <span className="font-medium">
              {remaining === 0 && !hasZeroItem && (lang === "en" ? "✓ Amount fully split" : "✓ Valor totalmente dividido")}
              {remaining === 0 && hasZeroItem && (lang === "en" ? "⚠ Some charge has $0 value" : "⚠ Alguma cobrança está com valor R$ 0")}
              {remaining > 0 && (lang === "en" ? `Still need to split ${formatBRL(remaining)}` : `Falta dividir ${formatBRL(remaining)}`)}
              {remaining < 0 && (lang === "en" ? `⚠ Exceeded by ${formatBRL(-remaining)}` : `⚠ Ultrapassou em ${formatBRL(-remaining)}`)}
            </span>
            <span className="tabular-nums opacity-70">
              {formatBRL(itemsSum)} / {formatBRL(totalCents)}
            </span>
          </div>
        )}

        {form.formState.errors.items && (
          <p className="mb-2 text-xs text-warn">{form.formState.errors.items.message}</p>
        )}

        <button
          type="button"
          onClick={addSplit}
          disabled={totalCents === 0}
          className="w-full border border-dashed border-hairline-strong rounded-sm py-2.5
            flex items-center justify-center gap-2 text-[13px] text-ink-muted bg-transparent
            hover:border-hairline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} />
          {hasSplits
            ? (lang === "en" ? "Add another person" : "Adicionar outra pessoa")
            : (lang === "en" ? "Add person" : "Adicionar pessoa")}
        </button>
      </div>

      {/* Notes */}
      <TextField
        label={lang === "en" ? "Notes" : "Notas"}
        placeholder={lang === "en" ? "Optional" : "Opcional"}
        multiline
        rows={3}
        {...form.register("notes")}
        className="mb-4"
      />

      {error && <p className="text-xs text-warn mb-3">{error}</p>}

      <div className="flex gap-2.5 mb-6 md:mb-0">
        <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
          {lang === "en" ? "Cancel" : "Cancelar"}
        </Button>
        <Button type="submit" disabled={loading || splitInvalid} style={{ flex: 2 }}
          title={splitInvalid ? (lang === "en" ? "Adjust charges to match total" : "Ajuste o valor das cobranças para corresponder ao total") : undefined}>
          {loading
            ? (lang === "en" ? "Saving…" : "Salvando…")
            : splitInvalid
            ? (lang === "en" ? "Adjust charges" : "Ajuste as cobranças")
            : (lang === "en" ? "Save debt" : "Salvar dívida")}
        </Button>
      </div>
    </form>
  )
}
