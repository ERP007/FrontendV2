import dayjs from 'dayjs'
import { Ban, Eye, Printer } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatCurrency, formatDate, formatDday, formatNumber } from '@/shared/lib/format'
import { FgDataTable, FgDomainStatusBadge, FgDropdownMenu } from '@/shared/ui'

import {
  isPoDelayed,
  poDominantUnit,
  poTotalAmount,
  poTotalQuantity,
} from '../model/ui-mock-types'

import type { PurchaseOrder } from '../model/ui-mock-types'

export interface PoTableProps {
  header?: ReactNode
  onOpen: (order: PurchaseOrder) => void
  orders: PurchaseOrder[]
}

export function PoTable({ header, onOpen, orders }: PoTableProps) {
  const today = dayjs().format('YYYY-MM-DD')

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        accessorKey: 'poNo',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.poNo}</span>,
        enableSorting: true,
        header: 'PO 번호',
        size: 140,
      },
      {
        accessorKey: 'supplierName',
        cell: ({ row }) => (
          <span className="block">
            <span className="block truncate font-semibold text-ink">{row.original.supplierName}</span>
            <span className="block text-meta font-medium text-faint">{row.original.supplierCode}</span>
          </span>
        ),
        header: '공급사',
      },
      {
        accessorKey: 'createdAt',
        cell: ({ row }) => <span className="font-medium text-muted">{formatDate(row.original.createdAt)}</span>,
        header: '등록일',
        size: 105,
      },
      {
        accessorKey: 'expectedAt',
        cell: ({ row }) => {
          const { expectedAt } = row.original
          if (!expectedAt) return <span className="font-medium text-faint">—</span>

          const delayed = isPoDelayed(row.original, today)

          return (
            <span className={cn('font-semibold', delayed ? 'text-danger' : 'text-ink-2')}>
              {formatDate(expectedAt)}
              {delayed ? <span className="ml-1.5 text-meta font-bold">({formatDday(expectedAt)})</span> : null}
            </span>
          )
        },
        header: '도착 예정일',
        size: 140,
      },
      {
        cell: ({ row }) => <span className="font-semibold text-ink-2">{row.original.lines.length}</span>,
        header: '품목 수',
        id: 'lineCount',
        meta: { align: 'right' },
        size: 70,
      },
      {
        cell: ({ row }) => (
          <span className="font-semibold text-ink">
            {formatNumber(poTotalQuantity(row.original.lines))}
            <span className="ml-1 text-meta font-medium text-faint">{poDominantUnit(row.original.lines)}</span>
          </span>
        ),
        header: '총 수량',
        id: 'totalQuantity',
        meta: { align: 'right' },
        size: 100,
      },
      {
        cell: ({ row }) => (
          <span className="font-bold text-ink">{formatCurrency(poTotalAmount(row.original.lines))}</span>
        ),
        enableSorting: true,
        header: '총 금액',
        id: 'totalAmount',
        meta: { align: 'right' },
        size: 130,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <FgDomainStatusBadge status={row.original.status} />,
        header: '상태',
        size: 125,
      },
      {
        cell: ({ row }) => (
          <FgDropdownMenu
            items={[
              {
                icon: <Eye aria-hidden className="h-4 w-4" />,
                label: '상세 보기',
                onSelect: () => onOpen(row.original),
              },
              { icon: <Printer aria-hidden className="h-4 w-4" />, label: '발주서 인쇄' },
              {
                danger: true,
                disabled: row.original.status !== 'DRAFT' && row.original.status !== 'APPROVED',
                icon: <Ban aria-hidden className="h-4 w-4" />,
                label: '주문 취소',
              },
            ]}
          />
        ),
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 70,
      },
    ],
    [onOpen, today],
  )

  return <FgDataTable columns={columns} data={orders} header={header} onRowClick={onOpen} />
}
