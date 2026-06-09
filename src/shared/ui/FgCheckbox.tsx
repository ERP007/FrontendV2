import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgCheckboxProps extends ComponentPropsWithoutRef<typeof Checkbox.Root> {
  label?: ReactNode
}

export function FgCheckbox({ className, label, ...props }: FgCheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2 text-label text-ink-2">
      <Checkbox.Root
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded border border-line bg-surface text-surface',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      >
        <Checkbox.Indicator>
          <Check aria-hidden className="h-3.5 w-3.5" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      {label}
    </label>
  )
}
