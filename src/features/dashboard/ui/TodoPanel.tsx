import { Building2, ChevronRight, ClipboardList } from 'lucide-react'
import { useMemo, useState } from 'react'

import { SO_STATUS_LABELS } from '@/features/sales-order'
import type { HqSalesOrderRow, SalesOrderStatus } from '@/features/sales-order'
import { formatDateTime, formatNumber } from '@/shared/lib/format'
import { FgCard, FgCardHeader, FgEmptyState, FgTabs } from '@/shared/ui'

/** 할 일 탭 — 출고 대기(REQUESTED) / 도착 대기(APPROVED) / 입고(DELIVERED) */
const TODO_TABS: SalesOrderStatus[] = ['REQUESTED', 'APPROVED', 'DELIVERED']

export interface TodoPanelProps {
  items: HqSalesOrderRow[]
  onSelect: (item: HqSalesOrderRow) => void
}

export function TodoPanel({ items, onSelect }: TodoPanelProps) {
  const [tab, setTab] = useState<SalesOrderStatus>('REQUESTED')

  const counts = useMemo(
    () => ({
      APPROVED: items.filter((item) => item.status === 'APPROVED').length,
      DELIVERED: items.filter((item) => item.status === 'DELIVERED').length,
      REQUESTED: items.filter((item) => item.status === 'REQUESTED').length,
    }),
    [items],
  )

  const visible = items.filter((item) => item.status === tab)

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
        items={TODO_TABS.map((status) => ({
          count: counts[status as 'REQUESTED' | 'APPROVED' | 'DELIVERED'],
          label: SO_STATUS_LABELS[status],
          value: status,
        }))}
        value={tab}
        onValueChange={(value) => setTab(value as SalesOrderStatus)}
      />
      <div className="-mx-2 flex-1 divide-y divide-line-soft">
        {visible.length === 0 ? (
          <FgEmptyState description="처리할 항목이 없습니다" title="모두 처리되었습니다" />
        ) : (
          visible.map((item) => (
            <button
              key={item.code}
              className="flex w-full items-center gap-3 rounded-control px-2 py-3 text-left transition-colors hover:bg-background"
              type="button"
              onClick={() => onSelect(item)}
            >
              <span className="w-28 shrink-0 text-meta font-semibold text-ink-2">{item.code}</span>
              <span className="flex w-32 shrink-0 items-center gap-1.5 text-meta font-medium text-muted">
                <Building2 aria-hidden className="h-3.5 w-3.5 text-faint" />
                <span className="truncate">{item.fromWarehouseName ?? item.fromWarehouseCode}</span>
              </span>
              <span className="min-w-0 flex-1 truncate text-label font-semibold text-ink">
                품목 {formatNumber(item.itemCount)}건
              </span>
              <span className="shrink-0 text-meta font-medium text-faint">
                {item.requestedAt ? formatDateTime(item.requestedAt) : '-'}
              </span>
              <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-faint" />
            </button>
          ))
        )}
      </div>
    </FgCard>
  )
}
