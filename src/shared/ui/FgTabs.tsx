import * as Tabs from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgTabItem {
  count?: ReactNode
  label: ReactNode
  value: string
}

export interface FgTabsProps {
  className?: string
  items: FgTabItem[]
  onValueChange?: (value: string) => void
  value?: string
}

export function FgTabs({ className, items, onValueChange, value }: FgTabsProps) {
  return (
    <Tabs.Root onValueChange={onValueChange} value={value}>
      <Tabs.List className={cn('inline-flex rounded-card border border-line bg-background p-1', className)}>
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            className="group inline-flex h-9 items-center gap-2 rounded-control px-4 text-label text-muted data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-card"
            value={item.value}
          >
            {item.label}
            {item.count !== undefined ? (
              <span className="rounded-pill bg-line-soft px-2 py-0.5 text-badge text-muted group-data-[state=active]:bg-primary-soft group-data-[state=active]:text-primary-strong">
                {item.count}
              </span>
            ) : null}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
