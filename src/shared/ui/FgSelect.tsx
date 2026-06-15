import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgSelectOption {
  disabled?: boolean
  label: string
  supportingText?: string
  value: string
}

export interface FgSelectProps {
  className?: string
  disabled?: boolean
  error?: string
  hint?: string
  label?: string
  leftIcon?: ReactNode
  name?: string
  onValueChange?: (value: string) => void
  options: FgSelectOption[]
  placeholder?: string
  required?: boolean
  value?: string
}

export function FgSelect({
  className,
  disabled,
  error,
  hint,
  label,
  leftIcon,
  name,
  onValueChange,
  options,
  placeholder = '선택',
  required,
  value,
}: FgSelectProps) {
  const helperText = error ?? hint

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <span className="block text-label text-ink-2">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </span>
      ) : null}
      <Select.Root disabled={disabled} name={name} onValueChange={onValueChange} value={value}>
        <Select.Trigger
          className={cn(
            'flex h-11 w-full items-center justify-between gap-3 rounded-control border border-line bg-surface px-3.5 text-left text-body text-ink transition-colors',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-muted',
            error && 'border-danger focus:border-danger focus:ring-danger',
          )}
          aria-invalid={error ? true : undefined}
        >
          <span className="flex min-w-0 items-center gap-3">
            {leftIcon ? <span className="flex h-5 w-5 items-center justify-center text-faint">{leftIcon}</span> : null}
            <Select.Value placeholder={placeholder} />
          </span>
          <Select.Icon asChild>
            <ChevronDown aria-hidden className="h-4 w-4 text-faint" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-50 max-h-80 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-control border border-line bg-surface shadow-popover"
            position="popper"
            sideOffset={6}
          >
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'relative flex min-h-10 cursor-pointer select-none items-center gap-3 rounded-control px-3 py-2 pr-8 text-sm text-ink outline-none',
                    'data-[disabled]:pointer-events-none data-[disabled]:text-faint',
                    'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
                  )}
                >
                  <Select.ItemText>
                    <span className="font-semibold text-ink">
                      {option.label}
                      {option.supportingText ? (
                        <span className="ml-1.5 text-meta font-medium text-faint">
                          {option.supportingText}
                        </span>
                      ) : null}
                    </span>
                  </Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2 flex h-5 w-5 items-center justify-center text-primary">
                    <Check aria-hidden className="h-4 w-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {helperText ? (
        <p className={cn('text-meta text-faint', error && 'text-danger')}>{helperText}</p>
      ) : null}
    </div>
  )
}
