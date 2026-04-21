import { formatDate, differenceInCalendarDays, addDays, addMonths, addWeeks, addYears } from "date-fns"
import { toZonedTime } from "date-fns-tz"

const TZ = "America/Sao_Paulo"

/** Returns today's date in BRT (date object with time 00:00 local) */
export function todayBRT(): Date {
  return toZonedTime(new Date(), TZ)
}

/** Parses "YYYY-MM-DD" into a Date using LOCAL date components (no timezone shift) */
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y!, m! - 1, d!)
}

/** Formats a Date or ISO string as "YYYY-MM-DD" */
export function toISODate(d: Date | string): string {
  const date = typeof d === "string" ? parseLocalDate(d) : d
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Days until a due date from today (negative = overdue) */
export function daysUntilDue(dueDateStr: string): number {
  const today = todayBRT()
  const due = parseLocalDate(dueDateStr)
  return differenceInCalendarDays(due, today)
}

/** Formats a date string as "dd/MM/yyyy" */
export function formatDateBR(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

/** Formats a date string as "12 mai" */
export function formatDateShort(dateStr: string): string {
  const d = parseLocalDate(dateStr)
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
  return daysBefore.map((n) => toISODate(addDays(parseLocalDate(dueDateStr), -n)))
}
