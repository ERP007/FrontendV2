import { forwardRef, useId } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgTextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'className'> {
  error?: string
  hint?: string
  label?: string
  rootClassName?: string
  textareaClassName?: string
}

export const FgTextarea = forwardRef<HTMLTextAreaElement, FgTextareaProps>(
  (
    {
      disabled,
      error,
      hint,
      id,
      label,
      required,
      rootClassName,
      textareaClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const helperText = error ?? hint
    const helperId = helperText ? `${textareaId}-helper` : undefined

    return (
      <div className={cn('space-y-2', rootClassName)}>
        {label ? (
          <label className="block text-label text-ink-2" htmlFor={textareaId}>
            {label}
            {required ? <span className="text-danger"> *</span> : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={helperId}
          className={cn(
            'min-h-24 w-full resize-none rounded-control border border-line bg-surface px-3.5 py-3 text-body text-ink outline-none transition-colors placeholder:text-faint',
            'focus:border-primary focus:ring-1 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted',
            error && 'border-danger focus:border-danger focus:ring-danger',
            textareaClassName,
          )}
          {...props}
        />
        {helperText ? (
          <p id={helperId} className={cn('text-meta text-faint', error && 'text-danger')}>
            {helperText}
          </p>
        ) : null}
      </div>
    )
  },
)

FgTextarea.displayName = 'FgTextarea'
