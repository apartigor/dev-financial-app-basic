import { AppShell } from "@/shared/ui/app-shell"
import { Skeleton, DebtRowSkeleton, HeroSummarySkeleton, CalendarStripSkeleton } from "@/shared/ui/skeleton"

export default function DashboardLoading() {
  return (
    <AppShell title="..." subtitle="budFin">
      <Skeleton className="h-3 w-64 mb-3" />
      <div className="md:grid md:grid-cols-2 md:gap-4">
        <HeroSummarySkeleton />
        <CalendarStripSkeleton />
      </div>
      <Skeleton className="h-5 w-40 mt-5 mb-2.5" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 3 }).map((_, i) => <DebtRowSkeleton key={i} />)}
      </div>
    </AppShell>
  )
}
