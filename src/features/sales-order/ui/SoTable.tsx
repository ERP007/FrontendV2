import dayjs from 'dayjs'
import { Eye, FileText, PackageCheck } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatDateTime, formatDday, formatNumber } from '@/shared/lib/format'
import { FgButton, FgDataTable, FgDomainStatusBadge, FgDropdownMenu } from '@/shared/ui'

import { IN_PROGRESS_STATUSES, isSoDelayed, soTotalRequested } from '../model/types'

import type { SalesOrder } from '../model/types'

export interface SoTableProps {
  header?: ReactNode
  onOpen: (order: SalesOrder) => void
  orders: SalesOrder[]
}

/** SO-01 본사용 발주 요청 테이블 */
export function SoTable({ header, onOpen, orders }: SoTableProps) {
  const today = dayjs().format('YYYY-MM-DD')

  const columns = useMemo<ColumnDef<SalesOrder>[]>(
    () => [
      {
        accessorKey: 'reqNo',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.reqNo}</span>,
        enableSorting: true,
        header: '요청번호',
        size: 140,
      },
      {
        accessorKey: 'branchName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block truncate font-semibold text-ink">{row.original.branchName}</span>
            <span className="block text-meta font-medium text-faint">{row.original.branchCode}</span>
          </span>
        ),
        header: '지점',
        size: 150,
      },
      {
        accessorKey: 'requesterName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block font-semibold text-ink-2">{row.original.requesterName}</span>
            <span className="block text-meta font-medium text-faint">{row.original.requesterRole}</span>
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
        accessorKey: 'desiredAt',
        cell: ({ row }) => {
          const delayed = isSoDelayed(row.original, today)

          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(row.original.desiredAt)}
              {delayed ? (
                <span className="ml-1.5 text-meta font-bold">({formatDday(row.original.desiredAt)})</span>
              ) : null}
            </span>
          )
        },
        header: '도착 희망일',
        size: 135,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.lines.length}</span>,
        header: '품목',
        id: 'lineCount',
        meta: { align: 'right' },
        size: 60,
      },
      {
        cell: ({ row }) => (
          <span className="font-semibold text-ink">
            {formatNumber(soTotalRequested(row.original.lines))}
            <span className="ml-1 text-meta font-medium text-faint">EA</span>
          </span>
        ),
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 95,
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

  return <FgDataTable columns={columns} data={orders} header={header} onRowClick={onOpen} />
}

export interface SoBranchTableProps {
  header?: ReactNode
  onArrival: (order: SalesOrder) => void
  onOpen: (order: SalesOrder) => void
  orders: SalesOrder[]
}

/** SO-04 지점용 발주 요청 테이블 */
export function SoBranchTable({ header, onArrival, onOpen, orders }: SoBranchTableProps) {
  const today = dayjs().format('YYYY-MM-DD')

  const columns = useMemo<ColumnDef<SalesOrder>[]>(
    () => [
      {
        accessorKey: 'reqNo',
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-semibold text-ink">
            {IN_PROGRESS_STATUSES.includes(row.original.status) ? (
              <span className="h-1.5 w-1.5 shrink-0 rounded-pill bg-primary" />
            ) : (
              <span className="h-1.5 w-1.5 shrink-0" />
            )}
            {row.original.reqNo}
          </span>
        ),
        enableSorting: true,
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
        accessorKey: 'desiredAt',
        cell: ({ row }) => {
          const delayed = isSoDelayed(row.original, today)

          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(row.original.desiredAt)}
              {delayed ? (
                <span className="ml-1.5 text-meta font-bold">({formatDday(row.original.desiredAt)})</span>
              ) : null}
            </span>
          )
        },
        header: '도착 희망일',
        size: 150,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.lines.length}</span>,
        header: '품목',
        id: 'lineCount',
        meta: { align: 'right' },
        size: 60,
      },
      {
        cell: ({ row }) => (
          <span className="font-semibold text-ink">
            {formatNumber(soTotalRequested(row.original.lines))}
            <span className="ml-1 text-meta font-medium text-faint">EA</span>
          </span>
        ),
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 100,
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
                disabled: row.original.status !== 'SHIPPED',
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

  return <FgDataTable columns={columns} data={orders} header={header} onRowClick={onOpen} />
}
