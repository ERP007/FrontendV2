import { forwardRef, useId } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type FgInputSize = 'md' | 'lg'
type FgInputGap = 'default' | 'tight'

const inputSizeClasses: Record<FgInputSize, string> = {
  md: 'h-11 rounded-control border px-3',
  lg: 'h-13 rounded-control-lg border-1.5 px-4',
}

const inputGapClasses: Record<FgInputSize, Record<FgInputGap, string>> = {
  md: {
    default: 'gap-3',
    tight: 'gap-2',
  },
  lg: {
    default: 'gap-3.5',
    tight: 'gap-2',
  },
}

export interface FgInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'prefix' | 'size'> {
  controlClassName?: string
  controlGap?: FgInputGap
  error?: string
  hint?: string
  inputClassName?: string
  label?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  rightIconClassName?: string
  rootClassName?: string
  size?: FgInputSize
}

export const FgInput = forwardRef<HTMLInputElement, FgInputProps>(
  (
    {
      disabled,
      controlClassName,
      controlGap = 'default',
      error,
      hint,
      id,
      inputClassName,
      label,
      leftIcon,
      required,
      rightIcon,
      rightIconClassName,
      rootClassName,
      size = 'md',
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const helperText = error ?? hint
    const helperId = helperText ? `${inputId}-helper` : undefined

    return (
      <div className={cn('space-y-2', rootClassName)}>
        {label ? (
          <label className="block text-label text-ink-2" htmlFor={inputId}>
            {label}
            {required ? <span className="text-danger"> *</span> : null}
          </label>
        ) : null}
        <div
          className={cn(
            'flex items-center border-line bg-surface text-body text-ink shadow-none transition-colors',
            inputSizeClasses[size],
            inputGapClasses[size][controlGap],
            'focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
            disabled && 'bg-line-soft text-muted',
            error && 'border-danger focus-within:border-danger focus-within:ring-danger',
            controlClassName,
          )}
        >
          {leftIcon ? <span className="flex h-5 w-5 items-center justify-center text-faint">{leftIcon}</span> : null}
          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={helperId}
            className={cn(
              'h-full min-w-0 flex-1 appearance-none border-none bg-transparent p-0 text-inherit outline-none placeholder:text-faint',
              'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed',
              inputClassName,
            )}
            {...props}
          />
          {rightIcon ? (
            <span
              className={cn(
                'flex h-5 shrink-0 items-center justify-center whitespace-nowrap text-faint',
                rightIconClassName,
              )}
            >
              {rightIcon}
            </span>
          ) : null}
        </div>
        {helperText ? (
          <p id={helperId} className={cn('whitespace-pre-line text-meta text-faint', error && 'text-danger')}>
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)

FgInput.displayName = 'FgInput'
