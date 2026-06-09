import { Minus, Plus } from 'lucide-react'
import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type FgStepperTone = 'default' | 'warning'

export interface FgStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  disabled?: boolean
  max?: number
  min?: number
  onChange?: (value: number) => void
  step?: number
  tone?: FgStepperTone
  value: number
}

export function FgStepper({
  className,
  disabled,
  max,
  min = 0,
  onChange,
  step = 1,
  tone = 'default',
  value,
  ...props
}: FgStepperProps) {
  const nextValue = Math.min(max ?? value + step, value + step)
  const previousValue = Math.max(min, value - step)
  const warning = tone === 'warning'

  return (
    <div
      className={cn(
        'inline-flex h-10 items-center overflow-hidden rounded-nav border bg-surface text-body font-bold',
        warning ? 'border-warning-dot bg-warm text-warning' : 'border-line text-ink focus-within:border-primary',
        disabled && 'opacity-55',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-muted disabled:text-faint"
        disabled={disabled || value <= min}
        onClick={() => onChange?.(previousValue)}
      >
        <Minus aria-hidden className="h-4 w-4" />
        <span className="sr-only">감소</span>
      </button>
      <output className="w-16 text-center">{value.toLocaleString()}</output>
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-muted disabled:text-faint"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange?.(nextValue)}
      >
        <Plus aria-hidden className="h-4 w-4" />
        <span className="sr-only">증가</span>
      </button>
    </div>
  )
}
