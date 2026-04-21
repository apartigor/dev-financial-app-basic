import { AppShell } from "@/shared/ui/app-shell"
import { Skeleton } from "@/shared/ui/skeleton"

export default function DebtDetailLoading() {
  return (
    <AppShell title="..." subtitle="Carregando">
      <div className="bg-surface border border-hairline rounded-lg p-[22px] mb-4 space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-12 w-36" />
        <div className="pt-3.5 border-t border-dashed border-hairline flex gap-5">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="bg-surface border border-hairline rounded-md p-[18px] mb-4 space-y-3">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
      </div>
    </AppShell>
  )
}
