import { AppShell } from "@/shared/ui/app-shell"
import { Skeleton, DebtRowSkeleton } from "@/shared/ui/skeleton"

export default function DebtsLoading() {
  return (
    <AppShell title="Dívidas">
      <div className="flex gap-1.5 flex-wrap mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[30px] w-20 rounded-pill" />
        ))}
      </div>
      <div className="mb-5">
        <Skeleton className="h-3 w-24 mb-2" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => <DebtRowSkeleton key={i} />)}
        </div>
      </div>
    </AppShell>
  )
}
