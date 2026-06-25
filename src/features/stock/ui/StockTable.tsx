import { useMemo } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgDataTable } from '@/shared/ui'

import { StockStatusBadge } from './StockBadges'

import type { Stock, StockSort, StockSortKey } from '../model/types'

function quantityTextClass(stock: Stock): string {
  if (stock.status === 'LOW') return 'text-warning'
  return 'text-ink'
}

/** 비활성 창고 또는 비활성 아이템의 재고 행(IV-01). 부품명·코드를 흐리게 표시한다. */
function isRowInactive(stock: Stock): boolean {
  return stock.warehouseActive === false || stock.itemActive === false
}

const ITEM_TEXT_COLUMN_SIZE = 216
const ITEM_TEXT_CLASS = 'block w-44 truncate'
const WAREHOUSE_COLUMN_SIZE = 232

export interface StockTableProps {
  header?: React.ReactNode
  onSelect: (stock: Stock) => void
  onSortChange: (sort: StockSort) => void
  selectedId: number | null
  sort: StockSort
  stocks: Stock[]
}

export function StockTable({ header, onSelect, onSortChange, selectedId, sort, stocks }: StockTableProps) {
  // 현재 정렬을 tanstack SortingState로 투영한다. safetyRatio(안전재고 대비)는 표에 컬럼이 없어
  // 어떤 헤더도 활성으로 표시되지 않는다(그 정렬은 필터바의 '안전재고 대비' 버튼이 담당).
  const sortingState: SortingState = [{ desc: sort.direction === 'desc', id: sort.field }]

  // 헤더 토글 결과(SortingState)를 백엔드 정렬값(StockSort)으로 환산한다.
  // 정렬 가능 컬럼은 부품명(name)·현재고(quantity)·최근 조정일(lastAdjustedAt)뿐이다.
  const handleSortingChange = (next: SortingState) => {
    const first = next[0]
    if (first) {
      onSortChange({ direction: first.desc ? 'desc' : 'asc', field: first.id as StockSortKey })
    }
  }

  const columns = useMemo<ColumnDef<Stock>[]>(
    () => [
      {
        accessorKey: 'sku',
        // 비활성 창고·비활성 아이템 재고는 부품명·코드를 흐리게 표시한다(IV-01).
        cell: ({ row }) => (
          <span
            className={cn(
              ITEM_TEXT_CLASS,
              'font-semibold',
              isRowInactive(row.original) ? 'text-faint' : 'text-ink',
            )}
            title={row.original.sku}
          >
            {row.original.sku}
          </span>
        ),
        header: '부품코드',
        size: ITEM_TEXT_COLUMN_SIZE,
      },
      {
        accessorKey: 'itemName',
        cell: ({ row }) => (
          <span
            className={cn(
              ITEM_TEXT_CLASS,
              'font-semibold',
              isRowInactive(row.original) ? 'text-faint' : 'text-ink',
            )}
            title={row.original.itemName}
          >
            {row.original.itemName}
          </span>
        ),
        enableSorting: true,
        header: '부품명',
        id: 'name',
        size: ITEM_TEXT_COLUMN_SIZE,
      },
      {
        accessorKey: 'warehouseName',
        // 비활성 창고는 같은 줄에서 배지로 표시해 창고명이 2줄로 밀리지 않게 한다(IV-01).
        cell: ({ row }) => (
          <span className="flex w-48 max-w-full items-center gap-1.5 font-medium text-ink-2">
            <span className="min-w-0 flex-1 truncate" title={row.original.warehouseName}>
              {row.original.warehouseName}
            </span>
            {row.original.warehouseActive === false ? (
              <span className="shrink-0 rounded-badge bg-line-soft px-1.5 py-0.5 text-badge text-faint">
                비활성
              </span>
            ) : null}
          </span>
        ),
        header: '창고',
        size: WAREHOUSE_COLUMN_SIZE,
      },
      {
        accessorKey: 'quantity',
        cell: ({ row }) => (
          <span className={cn('font-bold', quantityTextClass(row.original))}>
            {formatNumber(row.original.quantity)}
          </span>
        ),
        enableSorting: true,
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
        enableSorting: true,
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
      enableSortingRemoval={false}
      header={header}
      isRowSelected={(stock) => stock.id === selectedId}
      manualSorting
      sorting={sortingState}
      onRowClick={onSelect}
      onSortingChange={handleSortingChange}
    />
  )
}
