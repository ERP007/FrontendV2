import { Building2, Pencil, Power, Warehouse as WarehouseIcon } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'

import { cn } from '@/shared/lib/cn'
import { FgDataTable, FgDropdownMenu } from '@/shared/ui'

import { WarehouseActiveBadge, WarehouseTypeBadge } from './WarehouseBadges'

import type { WarehouseListItem, WarehouseSort, WarehouseSortField } from '../model/types'

export interface WarehouseTableProps {
  canManage: boolean
  onEdit: (warehouse: WarehouseListItem) => void
  onSortChange: (sort: WarehouseSort) => void
  onToggleActive: (warehouse: WarehouseListItem) => void
  sort: WarehouseSort
  total: number
  warehouses: WarehouseListItem[]
}

export function WarehouseTable({
  canManage,
  onEdit,
  onSortChange,
  onToggleActive,
  sort,
  total,
  warehouses,
}: WarehouseTableProps) {
  const sortingState: SortingState = [{ desc: sort.direction === 'desc', id: sort.field }]

  // tanstack의 정렬 토글 결과(SortingState)를 백엔드 정렬값(WarehouseSort)으로 환산한다.
  // 정렬을 완전히 해제하면 서버 기본값(code,asc)으로 되돌린다(서버는 항상 정렬값을 요구).
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sortingState) : updater
    const first = next[0]
    onSortChange(
      first
        ? { direction: first.desc ? 'desc' : 'asc', field: first.id as WarehouseSortField }
        : { direction: 'asc', field: 'code' },
    )
  }

  const columns = useMemo<ColumnDef<WarehouseListItem>[]>(
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
        enableSorting: true,
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
        accessorKey: 'active',
        cell: ({ row }) => <WarehouseActiveBadge active={row.original.active} />,
        header: '상태',
        size: 110,
      },
      {
        cell: ({ row }) => (
          // 행 클릭(수정)과 분리: 액션 메뉴 클릭이 행 클릭으로 전파되지 않게 막는다.
          <div onClick={(event) => event.stopPropagation()}>
            <FgDropdownMenu
              items={[
                {
                  disabled: !canManage,
                  icon: <Pencil aria-hidden className="h-4 w-4" />,
                  label: '수정',
                  onSelect: () => onEdit(row.original),
                },
                {
                  danger: row.original.active,
                  disabled: !canManage,
                  icon: <Power aria-hidden className="h-4 w-4" />,
                  label: row.original.active ? '비활성 전환' : '활성 전환',
                  onSelect: () => onToggleActive(row.original),
                },
              ]}
            />
          </div>
        ),
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 70,
      },
    ],
    [canManage, onEdit, onToggleActive],
  )

  return (
    <FgDataTable
      columns={columns}
      data={warehouses}
      header={
        <span>
          전체 <strong className="text-ink">{total}</strong>개
        </span>
      }
      manualSorting
      sorting={sortingState}
      onRowClick={canManage ? onEdit : undefined}
      onSortingChange={handleSortingChange}
    />
  )
}
