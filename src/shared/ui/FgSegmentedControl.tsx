import * as RadioGroup from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

export interface FgSegmentedOption {
  disabled?: boolean
  label: string
  value: string
}

export interface FgSegmentedControlProps {
  className?: string
  disabled?: boolean
  onValueChange?: (value: string) => void
  options: FgSegmentedOption[]
  value?: string
}

export function FgSegmentedControl({
  className,
  disabled,
  onValueChange,
  options,
  value,
}: FgSegmentedControlProps) {
  return (
    <RadioGroup.Root
      className={cn('grid gap-2', className)}
      disabled={disabled}
      onValueChange={onValueChange}
      value={value}
    >
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            'group flex h-11 items-center justify-center gap-2 rounded-control border border-line bg-surface px-4 text-sm font-semibold text-ink-2',
            'data-[state=checked]:border-primary data-[state=checked]:bg-primary-soft data-[state=checked]:text-primary-strong',
            'disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-faint',
          )}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-pill border border-muted group-data-[state=checked]:border-primary">
            <RadioGroup.Indicator>
              <Circle aria-hidden className="h-2 w-2 fill-current text-current" />
            </RadioGroup.Indicator>
          </span>
          {option.label}
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  )
}
