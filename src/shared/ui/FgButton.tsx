import { Slot } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type FgButtonVariant = 'primary' | 'default' | 'soft' | 'ghost' | 'danger' | 'dangerSolid'
type FgButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClasses: Record<FgButtonVariant, string> = {
  primary: 'border-primary bg-primary text-surface shadow-primary hover:bg-primary-strong',
  default: 'border-line bg-surface text-ink-2 hover:bg-background',
  soft: 'border-primary-line bg-primary-soft text-primary-strong hover:bg-surface',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-background hover:text-ink-2',
  danger: 'border-line bg-surface text-danger hover:bg-danger-bg',
  dangerSolid: 'border-danger bg-danger text-surface shadow-card hover:bg-danger',
}

const sizeClasses: Record<FgButtonSize, string> = {
  sm: 'h-8 px-3 text-label',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-body',
  icon: 'h-9 w-9 p-0',
}

export interface FgButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  leftIcon?: ReactNode
  loading?: boolean
  rightIcon?: ReactNode
  size?: FgButtonSize
  variant?: FgButtonVariant
}

export const FgButton = forwardRef<HTMLButtonElement, FgButtonProps>(
  (
    {
      asChild = false,
      children,
      className,
      disabled,
      leftIcon,
      loading = false,
      rightIcon,
      size = 'md',
      type = 'button',
      variant = 'default',
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : 'button'

    return (
      <Component
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center gap-2 rounded-control border font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-55',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        type={asChild ? undefined : type}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </Component>
    )
  },
)

FgButton.displayName = 'FgButton'
