import { Pencil, Power } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatDate, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgDataTable, FgDropdownMenu } from '@/shared/ui'

import type { Item } from '../model/types'

export interface ItemTableProps {
  emptyState?: ReactNode
  header?: ReactNode
  items: Item[]
  onToggleActive?: (item: Item) => void
}

export function ItemTable({ emptyState, header, items, onToggleActive }: ItemTableProps) {
  const columns = useMemo<ColumnDef<Item>[]>(
    () => {
      const baseColumns: ColumnDef<Item>[] = [
        {
          accessorKey: 'code',
          cell: ({ row }) => <span className="font-semibold text-ink">{row.original.code}</span>,
          header: '부품 코드',
          size: 150,
        },
        {
          accessorKey: 'name',
          cell: ({ row }) => <span className="font-bold text-ink">{row.original.name}</span>,
          header: '부품명',
        },
        {
          cell: ({ row }) => (
            <span className="font-medium text-muted">
              {row.original.majorCategory}
              {row.original.middleCategory ? (
                <>
                  <span className="mx-1.5 text-faint">›</span>
                  {row.original.middleCategory}
                </>
              ) : null}
            </span>
          ),
          header: '분류',
          id: 'category',
          size: 170,
        },
        {
          accessorKey: 'unit',
          cell: ({ row }) => (
            <span className="text-table font-semibold text-ink-2">{row.original.unit}</span>
          ),
          header: '단위',
          meta: { align: 'center' },
          size: 70,
        },
        {
          accessorKey: 'defaultSafetyStock',
          cell: ({ row }) => (
            <span className="font-bold text-ink">
              {formatNumber(row.original.defaultSafetyStock)}
            </span>
          ),
          header: '안전재고 기본',
          meta: { align: 'right' },
          size: 110,
        },
        {
          accessorKey: 'active',
          cell: ({ row }) =>
            row.original.active ? (
              <FgBadge dot variant="success">
                활성
              </FgBadge>
            ) : (
              <FgBadge dot variant="off">
                비활성
              </FgBadge>
            ),
          header: '상태',
          size: 100,
        },
        {
          accessorKey: 'createdAt',
          cell: ({ row }) => (
            <span className="font-medium text-muted">{formatDate(row.original.createdAt)}</span>
          ),
          header: '등록일',
          size: 110,
        },
      ]

      if (!onToggleActive) {
        return baseColumns
      }

      return [
        ...baseColumns,
        {
          cell: ({ row }) => (
            <FgDropdownMenu
              items={[
                { icon: <Pencil aria-hidden className="h-4 w-4" />, label: '수정' },
                {
                  danger: row.original.active,
                  icon: <Power aria-hidden className="h-4 w-4" />,
                  label: row.original.active ? '비활성 전환' : '활성 전환',
                  onSelect: () => onToggleActive(row.original),
                },
              ]}
            />
          ),
          header: '액션',
          id: 'actions',
          meta: { align: 'center' },
          size: 70,
        },
      ]
    },
    [onToggleActive],
  )

  return <FgDataTable columns={columns} data={items} emptyState={emptyState} header={header} />
}
