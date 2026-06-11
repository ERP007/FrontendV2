import { Building2, Eye, Pencil, Power, Warehouse as WarehouseIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { FgDataTable, FgDropdownMenu } from '@/shared/ui'

import { WarehouseActiveBadge, WarehouseTypeBadge } from './WarehouseBadges'

import type { Warehouse } from '../model/types'

export interface WarehouseTableProps {
  onEdit: (warehouse: Warehouse) => void
  onToggleActive: (warehouse: Warehouse) => void
  warehouses: Warehouse[]
}

export function WarehouseTable({ onEdit, onToggleActive, warehouses }: WarehouseTableProps) {
  const columns = useMemo<ColumnDef<Warehouse>[]>(
    () => [
      {
        accessorKey: 'code',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.code}</span>,
        enableSorting: true,
        header: '창고 코드',
        size: 140,
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => {
          const isHq = row.original.type === 'HQ'

          return (
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-control border',
                  isHq ? 'border-primary-line bg-primary-soft text-primary' : 'border-line bg-background text-muted',
                )}
              >
                {isHq ? (
                  <Building2 aria-hidden className="h-4 w-4" />
                ) : (
                  <WarehouseIcon aria-hidden className="h-4 w-4" />
                )}
              </span>
              <span className={cn('truncate', isHq ? 'font-bold text-ink' : 'font-semibold text-ink')}>
                {row.original.name}
              </span>
            </span>
          )
        },
        enableSorting: true,
        header: '창고명',
        size: 220,
      },
      {
        accessorKey: 'type',
        cell: ({ row }) => <WarehouseTypeBadge type={row.original.type} />,
        header: '유형',
        size: 110,
      },
      {
        accessorKey: 'branchName',
        cell: ({ row }) => (
          <span className="font-medium text-ink-2">{row.original.branchName ?? '—'}</span>
        ),
        header: '소속 지점',
        size: 150,
      },
      {
        accessorKey: 'address',
        cell: ({ row }) => <span className="font-medium text-muted">{row.original.address}</span>,
        header: '주소',
      },
      {
        accessorKey: 'active',
        cell: ({ row }) => <WarehouseActiveBadge active={row.original.active} />,
        header: '상태',
        size: 110,
      },
      {
        cell: ({ row }) => (
          <FgDropdownMenu
            items={[
              {
                icon: <Pencil aria-hidden className="h-4 w-4" />,
                label: '수정',
                onSelect: () => onEdit(row.original),
              },
              {
                icon: <Eye aria-hidden className="h-4 w-4" />,
                label: '상세 보기',
                onSelect: () => onEdit(row.original),
              },
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
    ],
    [onEdit, onToggleActive],
  )

  return (
    <FgDataTable
      columns={columns}
      data={warehouses}
      header={
        <span>
          전체 <strong className="text-ink">{warehouses.length}</strong>개
        </span>
      }
    />
  )
}
