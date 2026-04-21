"use client"

import { cn } from "@/shared/lib/cn"
import { forwardRef } from "react"

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  prefix?: string
  suffix?: string
  hint?: string
  error?: string
  multiline?: boolean
  rows?: number
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, prefix, suffix, hint, error, multiline, rows = 3, className, ...props },
  ref
) {
  const inputCls = cn(
    "flex-1 bg-transparent border-none outline-none text-ink placeholder-ink-faint",
    "text-base font-sans resize-none w-full"
  )

  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label className="text-xs font-medium text-ink-muted uppercase tracking-[0.6px] mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex items-center bg-surface border border-hairline rounded-sm",
          multiline ? "px-3.5 py-3 items-start" : "px-3.5 h-[46px]",
          error && "border-warn"
        )}
      >
        {prefix && <span className="text-ink-faint mr-2 text-base flex-shrink-0">{prefix}</span>}
        {multiline ? (
          <textarea
            className={cn(inputCls, "min-h-[80px]")}
            rows={rows}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input ref={ref} className={inputCls} {...props} />
        )}
        {suffix && <span className="text-ink-faint ml-2 text-base flex-shrink-0">{suffix}</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-warn">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  )
})
