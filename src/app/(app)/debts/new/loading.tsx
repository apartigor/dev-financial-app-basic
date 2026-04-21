import { AppShell } from "@/shared/ui/app-shell"
import { Skeleton } from "@/shared/ui/skeleton"

export default function NewDebtLoading() {
  return (
    <AppShell title="Nova dívida" subtitle="Adicionar">
      <div className="pb-6 space-y-4">
        {/* Title */}
        <FieldSkeleton />

        {/* Direction */}
        <div>
          <Skeleton className="h-3 w-10 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-[42px] flex-1 rounded-sm" />
            <Skeleton className="h-[42px] flex-1 rounded-sm" />
          </div>
        </div>

        {/* Value + Date */}
        <div className="grid grid-cols-2 gap-2.5">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        {/* Reminder card */}
        <CardSkeleton rows={4} />

        {/* Splits card */}
        <CardSkeleton rows={1} />

        {/* Notes */}
        <FieldSkeleton tall />

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <Skeleton className="h-[42px] flex-1 rounded-sm" />
          <Skeleton className="h-[42px] rounded-sm" style={{ flex: 2 }} />
        </div>
      </div>
    </AppShell>
  )
}

function FieldSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div>
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className={tall ? "h-[80px] rounded-sm" : "h-[46px] rounded-sm"} />
    </div>
  )
}

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="bg-surface border border-hairline rounded-md p-[18px] space-y-2.5">
      <div className="flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded-sm" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="h-3 w-56" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[42px] rounded-sm" />
      ))}
    </div>
  )
}
