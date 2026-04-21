"use client"

import { cn } from "@/shared/lib/cn"
import { Check } from "lucide-react"

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label?: string
  size?: number
  disabled?: boolean
  className?: string
}

export function Checkbox({ checked, onChange, label, size = 20, disabled, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2.5 bg-transparent border-none p-0",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center flex-shrink-0 rounded-[6px] transition-all duration-150",
          checked
            ? "bg-accent border-accent"
            : "bg-transparent border-hairline-strong"
        )}
        style={{
          width: size,
          height: size,
          border: `1.5px solid`,
          borderColor: checked ? "var(--color-accent)" : "var(--color-hairline-strong)",
        }}
      >
        {checked && <Check size={size - 6} strokeWidth={2.5} className="text-white" />}
      </span>
      {label && <span className="text-sm text-left text-ink">{label}</span>}
    </button>
  )
}
