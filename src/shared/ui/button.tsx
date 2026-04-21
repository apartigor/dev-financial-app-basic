import { cn } from "@/shared/lib/cn"

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent"
type ButtonSize = "sm" | "md" | "lg"

const variantClass: Record<ButtonVariant, string> = {
  primary:   "bg-ink text-bg border border-transparent",
  secondary: "bg-surface text-ink border border-hairline-strong",
  ghost:     "bg-transparent text-ink-muted border border-transparent",
  accent:    "bg-accent text-white border border-transparent",
}

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-[34px] px-3.5 text-[13px]",
  md: "h-[42px] px-[18px] text-sm",
  lg: "h-[52px] px-[22px] text-md",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  full?: boolean
  children: React.ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  full,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm font-medium",
        "tracking-tight transition-transform duration-100",
        "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variantClass[variant],
        sizeClass[size],
        full && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
