import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronLeft, MoreVertical } from 'lucide-react'
import { Fragment } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgButton } from '@/shared/ui/FgButton'

export interface FgDropdownItem {
  ariaDisabled?: boolean
  danger?: boolean
  disabled?: boolean
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
  separatorBefore?: boolean
  subItems?: FgDropdownItem[]
}

export interface FgDropdownMenuProps {
  align?: 'start' | 'center' | 'end'
  items: FgDropdownItem[]
  trigger?: ReactNode
}

function dropdownItemClassName(item: FgDropdownItem) {
  return cn(
    'flex min-h-10 cursor-pointer select-none items-center gap-3 rounded-control px-3 py-2 text-label font-semibold text-ink-2 outline-none',
    'data-[disabled]:pointer-events-none data-[disabled]:text-faint',
    'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
    'focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
    item.danger && 'text-danger data-[highlighted]:bg-danger-bg data-[highlighted]:text-danger',
    item.ariaDisabled &&
      'cursor-not-allowed text-faint opacity-50 [&>svg]:text-faint data-[highlighted]:bg-background data-[highlighted]:text-faint',
    item.danger &&
      item.ariaDisabled &&
      'text-danger opacity-50 [&>svg]:text-danger data-[highlighted]:text-danger',
  )
}

function renderDropdownItem(item: FgDropdownItem, index: number) {
  if (item.subItems?.length) {
    return (
      <Fragment key={index}>
        {item.separatorBefore ? <DropdownMenu.Separator className="my-1 h-px bg-line-soft" /> : null}
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger
            aria-disabled={item.ariaDisabled || item.disabled || undefined}
            className={dropdownItemClassName(item)}
            disabled={item.disabled}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            <ChevronLeft aria-hidden className="ml-auto h-4 w-4 text-faint" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent
              alignOffset={-4}
              className="z-50 min-w-56 rounded-control bg-surface/95 p-1 shadow-popover backdrop-blur focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              sideOffset={8}
            >
              {item.subItems.map(renderDropdownItem)}
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
      </Fragment>
    )
  }

  return (
    <Fragment key={index}>
      {item.separatorBefore ? <DropdownMenu.Separator className="my-1 h-px bg-line-soft" /> : null}
      <DropdownMenu.Item
        aria-disabled={item.ariaDisabled || item.disabled || undefined}
        className={dropdownItemClassName(item)}
        disabled={item.disabled}
        onSelect={item.onSelect}
      >
        {item.icon}
        {item.label}
      </DropdownMenu.Item>
    </Fragment>
  )
}

export function FgDropdownMenu({ align = 'end', items, trigger }: FgDropdownMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <FgButton aria-label="액션 메뉴" size="icon" variant="default">
            <MoreVertical aria-hidden className="h-4 w-4" />
          </FgButton>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className="z-50 min-w-44 rounded-control bg-surface/95 p-1 shadow-popover backdrop-blur focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          sideOffset={6}
        >
          {items.map(renderDropdownItem)}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
