import { Building2, ChevronRight, ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { FgCard, FgCardHeader, FgEmptyState, FgTabs } from '@/shared/ui'

import { TODO_CATEGORY_LABELS } from '../model/types'

import type { TodoCategory, TodoItem } from '../model/types'

export interface TodoPanelProps {
  items: TodoItem[]
  onSelect: (item: TodoItem) => void
}

export function TodoPanel({ items, onSelect }: TodoPanelProps) {
  const [tab, setTab] = useState<TodoCategory>('APPROVAL')

  const counts = useMemo(
    () => ({
      APPROVAL: items.filter((item) => item.category === 'APPROVAL').length,
      ARRIVAL: items.filter((item) => item.category === 'ARRIVAL').length,
      SHIP: items.filter((item) => item.category === 'SHIP').length,
    }),
    [items],
  )

  const visible = items.filter((item) => item.category === tab)

  return (
    <FgCard className="flex h-full flex-col">
      <FgCardHeader
        actions={
          <span className="text-meta font-medium text-faint">총 {formatNumber(items.length)}건</span>
        }
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        title="할 일"
      />
      <FgTabs
        className="mb-2"
        items={[
          { count: counts.APPROVAL, label: TODO_CATEGORY_LABELS.APPROVAL, value: 'APPROVAL' },
          { count: counts.SHIP, label: TODO_CATEGORY_LABELS.SHIP, value: 'SHIP' },
          { count: counts.ARRIVAL, label: TODO_CATEGORY_LABELS.ARRIVAL, value: 'ARRIVAL' },
        ]}
        value={tab}
        onValueChange={(value) => setTab(value as TodoCategory)}
      />
      <div className="-mx-2 flex-1 divide-y divide-line-soft">
        {visible.length === 0 ? (
          <FgEmptyState description="처리할 항목이 없습니다" title="모두 처리되었습니다" />
        ) : (
          visible.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center gap-3 rounded-control px-2 py-3 text-left transition-colors hover:bg-background"
              type="button"
              onClick={() => onSelect(item)}
            >
              <span className="w-24 shrink-0 text-meta font-semibold text-ink-2">{item.reqNo}</span>
              <span className="flex w-28 shrink-0 items-center gap-1.5 text-meta font-medium text-muted">
                <Building2 aria-hidden className="h-3.5 w-3.5 text-faint" />
                <span className="truncate">{item.warehouseName}</span>
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                <span className="truncate text-label font-semibold text-ink">{item.itemSummary}</span>
                <span className="shrink-0 text-meta font-medium text-faint">
                  · 수량 {formatNumber(item.totalQuantity)}
                </span>
              </span>
              <span
                className={cn(
                  'flex shrink-0 items-center gap-1.5 text-meta font-semibold',
                  item.urgency === 'DELAYED' ? 'text-danger' : 'text-muted',
                )}
              >
                {item.urgency === 'DELAYED' ? (
                  <span className="h-1.5 w-1.5 rounded-pill bg-danger" />
                ) : null}
                {item.whenLabel}
              </span>
              <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-faint" />
            </button>
          ))
        )}
      </div>
    </FgCard>
  )
}
