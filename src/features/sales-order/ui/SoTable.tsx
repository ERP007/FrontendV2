import { useMemo } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatDate, formatDateKorean } from '@/shared/lib/format'
import { FgDataTable, FgDomainStatusBadge } from '@/shared/ui'

import type { BranchSalesOrderRow, HqSalesOrderRow } from '../model/so-list-row'
import type { SalesOrderSortField, SortDirection } from '../model/types'

// 컬럼 폭: 요청번호 = 가변폭(size 150)으로 남는 가로폭을 흡수한다.
// 나머지는 고정폭. 상태는 whitespace-nowrap 으로 배지가 두 줄로 밀리지 않게 한다.
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
        size: 150, // 가변폭(absorber)
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
        size: 160,
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
        size: 160,
      },
      {
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">
            {row.original.requestedAt ? formatDate(row.original.requestedAt) : '—'}
          </span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 160,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.itemCount}</span>,
        header: '품목',
        id: 'itemCount',
        meta: { align: 'right' },
        size: 160,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.progressLabel} status={row.original.progressBadgeStatus} />
        ),
        header: '상태',
        meta: { cellClassName: 'whitespace-nowrap' },
        size: 160,
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
      enableSortingRemoval={false}
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
        size: 150, // 가변폭(absorber)
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
        size: 160,
      },
      {
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <span className="whitespace-nowrap font-medium text-muted">
            {row.original.requestedAt ? formatDateKorean(row.original.requestedAt) : '—'}
          </span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 160,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.itemCount}</span>,
        header: '품목',
        id: 'itemCount',
        meta: { align: 'right', cellClassName: 'pr-10', headClassName: 'pr-10' },
        size: 160,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <FgDomainStatusBadge label={row.original.progressLabel} status={row.original.progressBadgeStatus} />
        ),
        header: '상태',
        meta: { cellClassName: 'whitespace-nowrap' },
        size: 160,
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
      enableSortingRemoval={false}
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
