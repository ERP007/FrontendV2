import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgDataTable } from '@/shared/ui'

import { StockStatusBadge } from './StockBadges'

import type { Stock } from '../model/types'

function quantityTextClass(stock: Stock): string {
  if (stock.status === 'OUT') return 'text-danger'
  if (stock.status === 'LOW') return 'text-warning'
  return 'text-ink'
}

/** 비활성 창고 또는 비활성 아이템의 재고 행(IV-01). 부품명·코드를 흐리게 표시한다. */
function isRowInactive(stock: Stock): boolean {
  return stock.warehouseActive === false || stock.itemActive === false
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
        // 비활성 창고·비활성 아이템 재고는 부품명·코드를 흐리게 표시한다(IV-01).
        cell: ({ row }) => (
          <span className={cn('font-semibold', isRowInactive(row.original) ? 'text-faint' : 'text-ink')}>
            {row.original.sku}
          </span>
        ),
        header: '부품 코드',
        size: 140,
      },
      {
        accessorKey: 'itemName',
        cell: ({ row }) => (
          <span className={cn('font-semibold', isRowInactive(row.original) ? 'text-faint' : 'text-ink')}>
            {row.original.itemName}
          </span>
        ),
        header: '부품명',
      },
      {
        accessorKey: 'warehouseName',
        // 비활성 창고는 창고명 아래 줄에 '비활성'을 표시한다(IV-01).
        cell: ({ row }) => (
          <span className="flex flex-col gap-0.5 font-medium text-ink-2">
            <span>{row.original.warehouseName}</span>
            {row.original.warehouseActive === false ? (
              <span className="w-fit rounded-badge bg-line-soft px-1.5 py-0.5 text-badge text-faint">비활성</span>
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
        // 비활성 아이템은 재고 상태 대신 '비활성화'로 표시한다(IV-01).
        cell: ({ row }) =>
          row.original.itemActive === false ? (
            <FgBadge variant="off">비활성</FgBadge>
          ) : (
            <StockStatusBadge status={row.original.status} />
          ),
        header: '상태',
        size: 100,
      },
      {
        accessorKey: 'lastAdjustedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatDate(row.original.lastAdjustedAt)}</span>
        ),
        // 부품명 칸을 줄이고 그만큼 최근 조정일 칸을 넓힌다(ERP-252).
        header: '최근 조정일',
        size: 144,
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
