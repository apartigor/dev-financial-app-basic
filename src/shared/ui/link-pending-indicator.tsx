"use client"
import { useLinkStatus } from "next/link"
import { cn } from "@/shared/lib/cn"

interface Props {
  className?: string
  variant?: "dot" | "bar"
}

export function LinkPendingIndicator({ className, variant = "dot" }: Props) {
  const { pending } = useLinkStatus()
  if (!pending) return null

  if (variant === "bar") {
    return (
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-r-pill",
          "animate-pulse",
          className
        )}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0",
        className
      )}
    />
  )
}
