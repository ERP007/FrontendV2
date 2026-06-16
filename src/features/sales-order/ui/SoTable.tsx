import dayjs from 'dayjs'
import { Eye, FileText, PackageCheck } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatDateTime, formatDday, formatNumber } from '@/shared/lib/format'
import { FgButton, FgDataTable, FgDomainStatusBadge, FgDropdownMenu } from '@/shared/ui'

import { IN_PROGRESS_STATUSES, isSoDelayed } from '../model/types'

import type { BranchSalesOrderListItem } from '../api/use-branch-sales-orders-query'
import type {
  HqSalesOrderListItem,
  HqSalesOrderSortDirection,
  HqSalesOrderSortField,
} from '../api/use-hq-sales-orders-query'

export interface SoTableProps {
  header?: ReactNode
  onOpen: (order: HqSalesOrderListItem) => void
  onSortChange?: (field: HqSalesOrderSortField, direction: HqSalesOrderSortDirection) => void
  orders: HqSalesOrderListItem[]
  sortDirection?: HqSalesOrderSortDirection
  sortField?: HqSalesOrderSortField
}

/** SO-01 본사용 발주 요청 테이블 */
export function SoTable({
  header,
  onOpen,
  onSortChange,
  orders,
  sortDirection,
  sortField,
}: SoTableProps) {
  const today = dayjs().format('YYYY-MM-DD')

  const columns = useMemo<ColumnDef<HqSalesOrderListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.code}</span>,
        header: '요청번호',
        size: 140,
      },
      {
        accessorKey: 'fromWarehouseCode',
        cell: ({ row }) => (
          <span className="block font-semibold text-ink">{row.original.fromWarehouseCode}</span>
        ),
        header: '지점',
        size: 150,
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
        size: 150,
      },
      {
        accessorKey: 'desiredArrivalDate',
        cell: ({ row }) => {
          const delayed = isSoDelayed(
            { desiredAt: row.original.desiredArrivalDate, status: row.original.status },
            today,
          )

          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(row.original.desiredArrivalDate)}
              {delayed ? (
                <span className="ml-1.5 text-meta font-bold">
                  ({formatDday(row.original.desiredArrivalDate)})
                </span>
              ) : null}
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
        size: 60,
      },
      {
        cell: ({ row }) => {
          const { totalQuantity, unitSnapshot } = row.original
          if (unitSnapshot === null) {
            return <span className="font-semibold text-faint">-</span>
          }
          return (
            <span className="font-semibold text-ink">
              {formatNumber(totalQuantity)}
              <span className="ml-1 text-meta font-medium text-faint">{unitSnapshot}</span>
            </span>
          )
        },
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 110,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <FgDomainStatusBadge status={row.original.status} />,
        header: '상태',
        size: 130,
      },
      {
        cell: ({ row }) =>
          row.original.status === 'REQUESTED' ? (
            <FgButton size="sm" variant="soft" onClick={() => onOpen(row.original)}>
              검토
            </FgButton>
          ) : (
            <FgDropdownMenu
              items={[
                {
                  icon: <Eye aria-hidden className="h-4 w-4" />,
                  label: '상세 보기',
                  onSelect: () => onOpen(row.original),
                },
                { icon: <FileText aria-hidden className="h-4 w-4" />, label: '요청서 인쇄' },
              ]}
            />
          ),
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 85,
      },
    ],
    [onOpen, today],
  )

  const sorting = useMemo<SortingState>(
    () => (sortField ? [{ desc: sortDirection !== 'asc', id: sortField }] : []),
    [sortDirection, sortField],
  )

  return (
    <FgDataTable
      columns={columns}
      data={orders}
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
  onArrival: (order: BranchSalesOrderListItem) => void
  onOpen: (order: BranchSalesOrderListItem) => void
  onSortChange?: (field: 'requestedAt' | 'desiredArrivalDate', direction: 'asc' | 'desc') => void
  orders: BranchSalesOrderListItem[]
  sortDirection?: 'asc' | 'desc'
  sortField?: 'requestedAt' | 'desiredArrivalDate'
}

/** SO-04 지점용 발주 요청 테이블 */
export function SoBranchTable({
  header,
  onArrival,
  onOpen,
  onSortChange,
  orders,
  sortDirection,
  sortField,
}: SoBranchTableProps) {
  const today = dayjs().format('YYYY-MM-DD')

  const columns = useMemo<ColumnDef<BranchSalesOrderListItem>[]>(
    () => [
      {
        accessorKey: 'code',
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-semibold text-ink">
            {IN_PROGRESS_STATUSES.includes(row.original.status) ? (
              <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-primary" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0" />
            )}
            {row.original.code}
          </span>
        ),
        header: '요청번호',
        size: 170,
      },
      {
        accessorKey: 'requestedAt',
        cell: ({ row }) => (
          <span className="font-medium text-muted">{formatDateTime(row.original.requestedAt)}</span>
        ),
        enableSorting: true,
        header: '요청일',
        size: 160,
      },
      {
        accessorKey: 'desiredArrivalDate',
        enableSorting: true,
        cell: ({ row }) => {
          const delayed = isSoDelayed(
            { desiredAt: row.original.desiredArrivalDate, status: row.original.status },
            today,
          )

          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(row.original.desiredArrivalDate)}
              {delayed ? (
                <span className="ml-1.5 text-meta font-bold">
                  ({formatDday(row.original.desiredArrivalDate)})
                </span>
              ) : null}
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
        cell: ({ row }) => {
          const { totalQuantity, unitSnapshot } = row.original
          if (totalQuantity === null || unitSnapshot === null) {
            return <span className="font-semibold text-faint">-</span>
          }
          return (
            <span className="font-semibold text-ink">
              {formatNumber(totalQuantity)}
              <span className="ml-1 text-meta font-medium text-faint">{unitSnapshot}</span>
            </span>
          )
        },
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 110,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <FgDomainStatusBadge status={row.original.status} />,
        header: '상태',
        size: 135,
      },
      {
        cell: ({ row }) => (
          <FgDropdownMenu
            items={[
              {
                disabled: row.original.status !== 'APPROVED',
                icon: <PackageCheck aria-hidden className="h-4 w-4" />,
                label: '도착 확인',
                onSelect: () => onArrival(row.original),
              },
              {
                icon: <Eye aria-hidden className="h-4 w-4" />,
                label: '상세 보기',
                onSelect: () => onOpen(row.original),
              },
              { icon: <FileText aria-hidden className="h-4 w-4" />, label: '요청서 인쇄' },
            ]}
          />
        ),
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 70,
      },
    ],
    [onArrival, onOpen, today],
  )

  const sorting = useMemo<SortingState>(
    () => (sortField ? [{ desc: sortDirection !== 'asc', id: sortField }] : []),
    [sortDirection, sortField],
  )

  return (
    <FgDataTable
      columns={columns}
      data={orders}
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
