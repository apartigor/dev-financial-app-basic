import Link from "next/link"
import { AppShell } from "@/shared/ui/app-shell"
import { DebtRowLink } from "@/features/dashboard/components/debt-row-link"
import { HeroSummary } from "@/features/dashboard/components/hero-summary"
import { CalendarStrip } from "@/features/dashboard/components/calendar-strip"
import { DashboardGreeting, DashboardViewAll, DashboardUpcomingLabel } from "@/features/dashboard/components/dashboard-greeting"
import { getDashboardSummary, getUpcomingDebts, getCalendarDays } from "@/features/dashboard/queries"
import { getUser } from "@/shared/lib/supabase/server"

export default async function DashboardPage() {
  const [user, summary, upcoming, calendarDays] = await Promise.all([
    getUser(), getDashboardSummary(), getUpcomingDebts(5), getCalendarDays(),
  ])

  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? ""

  return (
    <AppShell>
      <DashboardGreeting firstName={firstName} overdueCount={summary.overdueCount} upcomingWeekCount={summary.upcomingWeekCount} />

      <div className="md:grid md:grid-cols-2 md:gap-4">
        <HeroSummary totalPayableCents={summary.totalPayableCents} totalReceivableCents={summary.totalReceivableCents} pendingCount={summary.pendingCount} overdueCount={summary.overdueCount} />
        <CalendarStrip days={calendarDays} />
      </div>

      <div className="flex items-baseline justify-between mt-5 mb-2.5">
        <h2 className="text-md font-medium"><DashboardUpcomingLabel /></h2>
        <Link href="/debts"><DashboardViewAll /></Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {upcoming.map((d) => (
          <DebtRowLink key={d.id} debt={{
            id: d.id, title: d.title,
            totalCents: Number(d.total_cents), paidCents: Number(d.paid_cents),
            dueDate: d.due_date,
            status: d.status as "pending" | "overdue" | "paid" | "empty",
            direction: d.direction as "payable" | "receivable",
            recurrenceRule: d.recurrence_rule,
            itemsCount: Number(d.items_count), itemsPaidCount: Number(d.items_paid_count),
          }} />
        ))}
      </div>
    </AppShell>
  )
}
