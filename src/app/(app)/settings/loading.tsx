import { AppShell } from "@/shared/ui/app-shell"
import { Skeleton } from "@/shared/ui/skeleton"

export default function SettingsLoading() {
  return (
    <AppShell title="Ajustes">
      {Array.from({ length: 3 }).map((_, g) => (
        <div key={g} className="mb-5">
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="bg-surface border border-hairline rounded-md overflow-hidden">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline last:border-0">
                <Skeleton className="w-[30px] h-[30px] rounded-[8px]" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </AppShell>
  )
}
