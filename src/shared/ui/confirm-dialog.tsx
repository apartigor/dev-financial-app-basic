"use client"
import { useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "./button"
import { cn } from "@/shared/lib/cn"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: "warn" | "default"
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape" && !loading) onCancel() }
    document.addEventListener("keydown", onEsc)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onEsc)
      document.body.style.overflow = ""
    }
  }, [open, loading, onCancel])

  if (!open || typeof window === "undefined") return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
    >
      {/* Backdrop */}
      <div
        onClick={() => !loading && onCancel()}
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-in fade-in duration-200"
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative bg-surface rounded-t-lg md:rounded-lg border border-hairline shadow-xl",
          "w-full md:max-w-[420px] p-6 md:p-7",
          "animate-in fade-in slide-in-from-bottom-4 md:zoom-in-95 duration-250"
        )}
      >
        <h2 id="confirm-title" className="font-serif text-[24px] leading-tight tracking-[-0.4px] text-ink mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-ink-muted mb-2 leading-relaxed">{description}</p>
        )}
        {children}

        <div className="flex gap-2.5 mt-6">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1",
              tone === "warn" && "!bg-warn !text-white !border-transparent hover:!bg-warn/90"
            )}
          >
            {loading ? "…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
