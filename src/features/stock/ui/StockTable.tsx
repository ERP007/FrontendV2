import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatNumber } from '@/shared/lib/format'
import { FgDataTable } from '@/shared/ui'

import { StockStatusBadge } from './StockBadges'

import type { Stock } from '../model/types'

function quantityTextClass(stock: Stock): string {
  if (stock.status === 'OUT') return 'text-danger'
  if (stock.status === 'LOW') return 'text-warning'
  return 'text-ink'
}

export interface StockTableProps {
  header?: React.ReactNode
  onSelect: (stock: Stock) => void
  selectedId: number | null
  stocks: Stock[]
}

export function StockTable({ header, onSelect, selectedId, stocks }: StockTableProps) {
  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        accessorKey: 'sku',
        // 비활성 창고 재고는 부품명·코드를 흐리게 표시한다(IV-01).
        cell: ({ row }) => (
          <span className={cn('font-semibold', row.original.warehouseActive === false ? 'text-faint' : 'text-ink')}>
            {row.original.sku}
          </span>
        ),
        header: '부품 코드',
        size: 140,
      },
      {
        accessorKey: 'itemName',
        cell: ({ row }) => (
          <span className={cn('font-semibold', row.original.warehouseActive === false ? 'text-faint' : 'text-ink')}>
            {row.original.itemName}
          </span>
        ),
        header: '부품명',
      },
      {
        accessorKey: 'warehouseName',
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 font-medium text-ink-2">
            {row.original.warehouseName}
            {row.original.warehouseActive === false ? (
              <span className="rounded-badge bg-line-soft px-1.5 py-0.5 text-badge text-faint">비활성</span>
            ) : null}
          </span>
        ),
        header: '창고',
        size: 130,
      },
      {
        accessorKey: 'quantity',
        cell: ({ row }) => (
          <span className={cn('font-bold', quantityTextClass(row.original))}>
            {formatNumber(row.original.quantity)}
          </span>
        ),
        header: '현재고',
        meta: { align: 'right' },
        size: 90,
      },
      {
        accessorKey: 'safetyStock',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatNumber(row.original.safetyStock)}</span>
        ),
        header: '안전재고',
        meta: { align: 'right' },
        size: 90,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <StockStatusBadge status={row.original.status} />,
        header: '상태',
        size: 100,
      },
      {
        accessorKey: 'lastAdjustedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatDate(row.original.lastAdjustedAt)}</span>
        ),
        header: '최근 조정일',
        size: 120,
      },
    ],
    [],
  )

  return (
    <FgDataTable
      columns={columns}
      data={stocks}
      header={header}
      isRowSelected={(stock) => stock.id === selectedId}
      onRowClick={onSelect}
    />
  )
}
