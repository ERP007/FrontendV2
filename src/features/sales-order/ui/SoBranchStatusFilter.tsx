import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { FgButton } from '@/shared/ui'

import {
  SO_STATUS_LABELS,
  SO_BRANCH_STATUS_ORDER,
} from '../model/ui-types'

import type { SalesOrderStatus } from '../model/ui-types'

export interface SoBranchStatusFilterProps {
  onChange: (next: SalesOrderStatus[] | undefined) => void
  value: SalesOrderStatus[] | undefined
}

function triggerLabel(value: SalesOrderStatus[] | undefined): string {
  if (!value || value.length === 0) return '상태 전체'
  if (value.length === 1) return SO_STATUS_LABELS[value[0]]
  return `상태 ${value.length}건 선택`
}

export function SoBranchStatusFilter({ onChange, value }: SoBranchStatusFilterProps) {
  const selected = new Set(value ?? [])

  function toggle(status: SalesOrderStatus, checked: boolean) {
    const next = new Set(selected)
    if (checked) next.add(status)
    else next.delete(status)
    const ordered = SO_BRANCH_STATUS_ORDER.filter((entry) => next.has(entry))
    onChange(ordered.length > 0 ? ordered : undefined)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <FgButton rightIcon={<ChevronDown aria-hidden className="h-4 w-4" />}>
          {triggerLabel(value)}
        </FgButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          className="z-50 min-w-44 rounded-control border border-line bg-surface p-1 shadow-popover"
          sideOffset={6}
        >
          {SO_BRANCH_STATUS_ORDER.map((status) => {
            const checked = selected.has(status)
            return (
              <DropdownMenu.CheckboxItem
                key={status}
                checked={checked}
                className={cn(
                  'flex min-h-9 cursor-pointer select-none items-center justify-between gap-3 rounded-control px-3 py-2 text-label text-ink-2 outline-none',
                  'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
                )}
                onCheckedChange={(next) => toggle(status, next === true)}
                onSelect={(event) => event.preventDefault()}
              >
                <span>{SO_STATUS_LABELS[status]}</span>
                {checked ? <Check aria-hidden className="h-4 w-4 text-primary" /> : null}
              </DropdownMenu.CheckboxItem>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
