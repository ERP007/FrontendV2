import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreVertical } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgButton } from '@/shared/ui/FgButton'

export interface FgDropdownItem {
  danger?: boolean
  disabled?: boolean
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
}

export interface FgDropdownMenuProps {
  align?: 'start' | 'center' | 'end'
  items: FgDropdownItem[]
  trigger?: ReactNode
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
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              className={cn(
                'flex min-h-9 cursor-pointer select-none items-center gap-2 rounded-control px-3 py-2 text-label text-ink-2 outline-none',
                'data-[disabled]:pointer-events-none data-[disabled]:text-faint',
                'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
                'focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0',
                item.danger && 'text-danger data-[highlighted]:bg-danger-bg data-[highlighted]:text-danger',
              )}
              disabled={item.disabled}
              onSelect={item.onSelect}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
