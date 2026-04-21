import { cn } from "@/shared/lib/cn"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-hairline rounded-sm animate-pulse", className)}
      {...props}
    />
  )
}

export function DebtRowSkeleton() {
  return (
    <div className="bg-surface border border-hairline rounded-md p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>
    </div>
  )
}

export function HeroSummarySkeleton() {
  return (
    <div className="bg-surface border border-hairline rounded-lg p-[22px]">
      <Skeleton className="h-3 w-32 mb-3" />
      <Skeleton className="h-10 w-40 mb-4" />
      <div className="pt-3.5 border-t border-dashed border-hairline flex gap-4">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="w-px bg-hairline" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  )
}

export function CalendarStripSkeleton() {
  return (
    <div className="bg-surface border border-hairline rounded-lg p-4 mt-3 md:mt-0">
      <div className="flex items-baseline justify-between mb-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <Skeleton key={i} className="h-[52px] rounded-sm" />
        ))}
      </div>
    </div>
  )
}
