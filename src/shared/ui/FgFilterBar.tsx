import { ChevronDown, RotateCcw, Search } from 'lucide-react'
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgButton } from '@/shared/ui/FgButton'
import { FgCard } from '@/shared/ui/FgCard'
import { FgInput } from '@/shared/ui/FgInput'
import { FgSelect } from '@/shared/ui/FgSelect'

import type { FgButtonProps } from '@/shared/ui/FgButton'
import type { FgCardProps } from '@/shared/ui/FgCard'
import type { FgInputProps } from '@/shared/ui/FgInput'
import type { FgSelectProps } from '@/shared/ui/FgSelect'

export interface FgFilterBarProps extends Omit<FgCardProps, 'children'> {
  actions?: ReactNode
  children: ReactNode
}

export function FgFilterBar({ actions, children, className, ...props }: FgFilterBarProps) {
  return (
    <FgCard
      className={cn('flex flex-wrap items-center justify-between gap-3 p-4', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">{actions}</div>
      ) : null}
    </FgCard>
  )
}

export type FgFilterSearchProps = Omit<FgInputProps, 'leftIcon'>

export function FgFilterSearch({ rootClassName, ...props }: FgFilterSearchProps) {
  return (
    <FgInput
      leftIcon={<Search aria-hidden className="h-4 w-4" />}
      rootClassName={cn('min-w-64 flex-1', rootClassName)}
      {...props}
    />
  )
}

export type FgFilterSelectProps = Omit<FgSelectProps, 'label' | 'notchedLabel'> & {
  label: string
}

export function FgFilterSelect({ className, label, triggerClassName, ...props }: FgFilterSelectProps) {
  return (
    <FgSelect
      className={cn('shrink-0', className)}
      notchedLabel={label}
      triggerClassName={cn('disabled:bg-surface', triggerClassName)}
      {...props}
    />
  )
}

export interface FgFilterMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  label: string
}

export const FgFilterMenuTrigger = forwardRef<HTMLButtonElement, FgFilterMenuTriggerProps>(
  (
    {
      children,
      className,
      disabled,
      label,
      type = 'button',
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        'relative flex h-11 shrink-0 items-center justify-between gap-3 rounded-control border border-line bg-surface px-3.5 text-left text-body text-ink transition-colors',
        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
        'disabled:cursor-not-allowed disabled:text-muted',
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      <span className="pointer-events-none absolute -top-2 left-3 bg-surface px-1 text-micro font-bold text-faint">
        {label}
      </span>
      <span className="min-w-0 truncate">{children}</span>
      <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-faint" />
    </button>
  ),
)

FgFilterMenuTrigger.displayName = 'FgFilterMenuTrigger'

export type FgFilterResetButtonProps = Omit<FgButtonProps, 'leftIcon'>

export function FgFilterResetButton({
  children = '초기화',
  variant = 'soft',
  ...props
}: FgFilterResetButtonProps) {
  return (
    <FgButton
      leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />}
      variant={variant}
      {...props}
    >
      {children}
    </FgButton>
  )
}
