"use client"
import { useState, forwardRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/shared/lib/cn"

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
  error?: string
  hint?: string
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, error, hint, className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px] mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center bg-surface border rounded-sm px-3.5 h-[46px]",
          "transition-colors focus-within:border-hairline-strong",
          error ? "border-warn" : "border-hairline"
        )}
      >
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className="flex-1 bg-transparent border-none outline-none text-ink placeholder-ink-faint text-base font-sans w-full"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="ml-2 p-1 -mr-1 rounded-sm text-ink-faint hover:text-ink-muted transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-warn">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  )
})
