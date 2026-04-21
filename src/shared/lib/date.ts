import { formatDate, differenceInCalendarDays, addDays, addMonths, addWeeks, addYears } from "date-fns"
import { toZonedTime } from "date-fns-tz"

const TZ = "America/Sao_Paulo"

/** Returns today's date in BRT (date object with time 00:00 local) */
export function todayBRT(): Date {
  return toZonedTime(new Date(), TZ)
}

/** Formats a Date or ISO string as "YYYY-MM-DD" */
export function toISODate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return formatDate(date, "yyyy-MM-dd")
}

/** Days until a due date from today (negative = overdue) */
export function daysUntilDue(dueDateStr: string): number {
  const today = todayBRT()
  const due = toZonedTime(new Date(dueDateStr + "T00:00:00"), TZ)
  return differenceInCalendarDays(due, today)
}

/** Formats a date string as "dd/MM/yyyy" */
export function formatDateBR(dateStr: string): string {
  const d = toZonedTime(new Date(dateStr + "T00:00:00"), TZ)
  return formatDate(d, "dd/MM/yyyy")
}

/** Formats a date string as "12 mai" */
export function formatDateShort(dateStr: string): string {
  const d = toZonedTime(new Date(dateStr + "T00:00:00"), TZ)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
}

/** Adds days/months/weeks/years to a date string, returns new "YYYY-MM-DD" */
export function addByRule(
  dateStr: string,
  rule: "monthly" | "weekly" | "yearly"
): string {
  const d = toZonedTime(new Date(dateStr + "T00:00:00"), TZ)
  const next =
    rule === "monthly" ? addMonths(d, 1) :
    rule === "weekly"  ? addWeeks(d, 1) :
    addYears(d, 1)
  return toISODate(next)
}

/** Generates absolute reminder dates from a debt's due date and days-before offsets */
export function buildReminderDates(
  dueDateStr: string,
  daysBefore: number[]
): string[] {
  const due = toZonedTime(new Date(dueDateStr + "T00:00:00"), TZ)
  return daysBefore.map((n) => toISODate(addDays(due, -n)))
}
