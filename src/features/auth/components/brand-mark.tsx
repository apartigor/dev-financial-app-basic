import { cn } from "@/shared/lib/cn"

interface BrandMarkProps {
  size?: "md" | "lg"
  className?: string
}

export function BrandMark({ size = "md", className }: BrandMarkProps) {
  const s = size === "lg" ? 40 : 32
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-dark.svg"
        alt=""
        width={s}
        height={s}
        className="rounded-[20%] dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-light.svg"
        alt=""
        width={s}
        height={s}
        className="rounded-[20%] hidden dark:block"
      />
      <span
        className="font-serif text-ink"
        style={{ fontSize: s * 0.7, letterSpacing: -0.5 }}
      >
        budFin
      </span>
    </div>
  )
}
