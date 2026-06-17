import { useMemo } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import { FgDataTable, FgDomainStatusBadge } from '@/shared/ui'

import type { BranchSalesOrderRow, HqSalesOrderRow } from '../model/so-list-row'
import type { SalesOrderSortField, SortDirection } from '../model/types'

export interface SoTableProps {
  header?: ReactNode
  onOpen: (row: HqSalesOrderRow) => void
  onSortChange?: (field: SalesOrderSortField, direction: SortDirection) => void
  rows: HqSalesOrderRow[]
  sortDirection?: SortDirection
  sortField?: SalesOrderSortField
}

/** SO-01 본사용 발주 요청 테이블 */
export function SoTable({ header, onOpen, onSortChange, rows, sortDirection, sortField }: SoTableProps) {
  const columns = useMemo<ColumnDef<HqSalesOrderRow>[]>(
    () => [
      {
        accessorKey: 'code',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.code}</span>,
        header: '요청번호',
        size: 190,
      },
      {
        accessorKey: 'fromWarehouseCode',
        cell: ({ row }) => (
          <span className="block font-semibold text-ink">{row.original.fromWarehouseCode}</span>
        ),
        header: '지점',
        size: 200,
      },
      {
        accessorKey: 'requesterName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block font-semibold text-ink-2">{row.original.requesterName}</span>
            <span className="block text-meta font-medium text-faint">
              {row.original.requesterPosition}
            </span>
          </span>
        ),
        header: '요청자',
        size: 130,
      },
      {
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatDateTime(row.original.requestedAt)}</span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 190,
      },
      {
        accessorKey: 'desiredArrivalDate',
        cell: ({ row }) => {
          const { dday, delayed, desiredArrivalDate } = row.original
          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(desiredArrivalDate)}
              {delayed ? <span className="ml-1.5 text-meta font-bold">({dday})</span> : null}
            </span>
          )
        },
        enableSorting: true,
        header: '도착 희망일',
        size: 135,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.itemCount}</span>,
        header: '품목',
        id: 'itemCount',
        meta: { align: 'right' },
        size: 90,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.totalQuantity}</span>,
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 110,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.statusLabel} status={row.original.status} />
        ),
        header: '상태',
        size: 130,
      },
    ],
    [],
  )

  const sorting = useMemo<SortingState>(
    () => (sortField ? [{ desc: sortDirection !== 'asc', id: sortField }] : []),
    [sortDirection, sortField],
  )

  return (
    <FgDataTable
      columns={columns}
      data={rows}
      header={header}
      manualSorting
      sorting={sorting}
      onRowClick={onOpen}
      onSortingChange={(next) => {
        if (!onSortChange) return
        const head = next[0]
        if (!head) return
        if (head.id !== 'requestedAt' && head.id !== 'desiredArrivalDate') return
        onSortChange(head.id, head.desc ? 'desc' : 'asc')
      }}
    />
  )
}

export interface SoBranchTableProps {
  header?: ReactNode
  onOpen: (row: BranchSalesOrderRow) => void
  onSortChange?: (field: 'requestedAt' | 'desiredArrivalDate', direction: 'asc' | 'desc') => void
  rows: BranchSalesOrderRow[]
  sortDirection?: 'asc' | 'desc'
  sortField?: 'requestedAt' | 'desiredArrivalDate'
}

/** SO-04 지점용 발주 요청 테이블 */
export function SoBranchTable({
  header,
  onOpen,
  onSortChange,
  rows,
  sortDirection,
  sortField,
}: SoBranchTableProps) {
  const columns = useMemo<ColumnDef<BranchSalesOrderRow>[]>(
    () => [
      {
        accessorKey: 'code',
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-semibold text-ink">
            {row.original.inProgress ? (
              <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-primary" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0" />
            )}
            {row.original.code}
          </span>
        ),
        header: '요청번호',
        size: 220,
      },
      {
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatDateTime(row.original.requestedAt)}</span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 200,
      },
      {
        accessorKey: 'desiredArrivalDate',
        enableSorting: true,
        cell: ({ row }) => {
          const { dday, delayed, desiredArrivalDate } = row.original
          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(desiredArrivalDate)}
              {delayed ? <span className="ml-1.5 text-meta font-bold">({dday})</span> : null}
            </span>
          )
        },
        header: '도착 희망일',
        size: 150,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.itemCount}</span>,
        header: '품목',
        id: 'itemCount',
        meta: { align: 'right' },
        size: 90,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.totalQuantity}</span>,
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 110,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.statusLabel} status={row.original.status} />
        ),
        header: '상태',
        size: 135,
      },
    ],
    [],
  )

  const sorting = useMemo<SortingState>(
    () => (sortField ? [{ desc: sortDirection !== 'asc', id: sortField }] : []),
    [sortDirection, sortField],
  )

  return (
    <FgDataTable
      columns={columns}
      data={rows}
      header={header}
      manualSorting
      sorting={sorting}
      onRowClick={onOpen}
      onSortingChange={(next) => {
        if (!onSortChange) return
        const head = next[0]
        if (!head) return
        if (head.id !== 'requestedAt' && head.id !== 'desiredArrivalDate') return
        onSortChange(head.id, head.desc ? 'desc' : 'asc')
      }}
    />
  )
}
