import { useMemo } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatDateTime } from '@/shared/lib/format'
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
        accessorKey: 'fromWarehouseName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block font-semibold text-ink">
              {row.original.fromWarehouseName ?? row.original.fromWarehouseCode}
            </span>
            <span className="block text-meta font-medium text-faint">
              {row.original.fromWarehouseCode}
            </span>
          </span>
        ),
        header: '지점',
        size: 200,
      },
      {
        accessorKey: 'requesterName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block font-semibold text-ink-2">{row.original.requesterName ?? '—'}</span>
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
          <span className="font-medium text-muted">
            {row.original.requestedAt ? formatDateTime(row.original.requestedAt) : '—'}
          </span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 190,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.itemCount}</span>,
        header: '품목',
        id: 'itemCount',
        meta: { align: 'right' },
        size: 90,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.progressLabel} status={row.original.status} />
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
        if (head.id !== 'requestedAt') return
        onSortChange(head.id, head.desc ? 'desc' : 'asc')
      }}
    />
  )
}

export interface SoBranchTableProps {
  header?: ReactNode
  onOpen: (row: BranchSalesOrderRow) => void
  onSortChange?: (field: SalesOrderSortField, direction: SortDirection) => void
  rows: BranchSalesOrderRow[]
  sortDirection?: SortDirection
  sortField?: SalesOrderSortField
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
        size: 240,
      },
      {
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">
            {row.original.requestedAt ? formatDateTime(row.original.requestedAt) : '—'}
          </span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 220,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.itemCount}</span>,
        header: '품목',
        id: 'itemCount',
        meta: { align: 'right' },
        size: 90,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.progressLabel} status={row.original.status} />
        ),
        header: '상태',
        size: 150,
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
        if (head.id !== 'requestedAt') return
        onSortChange(head.id, head.desc ? 'desc' : 'asc')
      }}
    />
  )
}
