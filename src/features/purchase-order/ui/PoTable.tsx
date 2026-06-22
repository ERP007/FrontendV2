import { useMemo } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/format'
import { FgDataTable, FgDomainStatusBadge } from '@/shared/ui'

import type { PurchaseOrderRow } from '../model/po-list-row'

export interface PoTableProps {
  header?: ReactNode
  onOpen: (row: PurchaseOrderRow) => void
  onSortingChange?: (sorting: SortingState) => void
  rows: PurchaseOrderRow[]
  sorting?: SortingState
}

export function PoTable({ header, onOpen, onSortingChange, rows, sorting }: PoTableProps) {
  const columns = useMemo<ColumnDef<PurchaseOrderRow>[]>(
    () => [
      {
        accessorKey: 'code',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.code}</span>,
        enableSorting: false,
        header: 'PO 번호',
        size: 140,
      },
      {
        accessorKey: 'vendorName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block truncate font-semibold text-ink">{row.original.vendorName}</span>
            <span className="block text-meta font-medium text-faint">{row.original.vendorCode}</span>
          </span>
        ),
        enableSorting: false,
        header: '공급사',
        size: 180,
      },
      {
        accessorKey: 'createdAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatDate(row.original.createdAt)}</span>
        ),
        enableSorting: true,
        header: '등록일',
        size: 130,
      },
      {
        accessorKey: 'desiredArrivalDate',
        cell: ({ row }) => {
          const { delayed, dday, desiredArrivalDate } = row.original
          if (!desiredArrivalDate) return <span className="font-medium text-faint">—</span>
          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(desiredArrivalDate)}
              {delayed ? <span className="ml-1.5 text-meta font-bold">({dday})</span> : null}
            </span>
          )
        },
        enableSorting: true,
        header: '도착 예정일',
        size: 140,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.lineCount}</span>,
        enableSorting: false,
        header: '품목 수',
        id: 'lineCount',
        meta: { align: 'right' },
        size: 90,
      },
      {
        cell: ({ row }) => (
          <span className="font-semibold text-ink">{row.original.totalQuantity}</span>
        ),
        enableSorting: false,
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 100,
      },
      {
        accessorKey: 'totalAmount',
        cell: ({ row }) => <span className="font-bold text-ink">{row.original.totalAmount}</span>,
        enableSorting: true,
        header: '총 금액',
        meta: { cellClassName: 'text-right', headClassName: 'text-right' },
        size: 170,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.statusLabel} status={row.original.status} />
        ),
        enableSorting: false,
        header: '상태',
        size: 125,
      },
    ],
    [],
  )

  return (
    <FgDataTable
      columns={columns}
      data={rows}
      header={header}
      manualSorting
      sorting={sorting}
      onRowClick={onOpen}
      onSortingChange={onSortingChange}
    />
  )
}
