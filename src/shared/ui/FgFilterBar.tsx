import { RotateCcw, Search } from 'lucide-react'
import type { ReactNode } from 'react'

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
