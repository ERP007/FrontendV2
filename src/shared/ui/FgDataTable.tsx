import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ColumnDef, OnChangeFn, RowData, SortingState } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgEmptyState } from '@/shared/ui/FgEmptyState'
import {
  FgTable,
  FgTableBody,
  FgTableCell,
  FgTableContainer,
  FgTableHead,
  FgTableHeader,
  FgTableRow,
} from '@/shared/ui/FgTable'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'center' | 'right'
    cellClassName?: string
    headClassName?: string
  }
}

const alignClasses = {
  center: 'text-center',
  right: 'text-right',
} as const

function SortIcon({ direction }: { direction: false | 'asc' | 'desc' }) {
  if (direction === 'asc') return <ChevronUp aria-hidden className="h-3 w-3" />
  if (direction === 'desc') return <ChevronDown aria-hidden className="h-3 w-3" />
  return <ChevronsUpDown aria-hidden className="h-3 w-3 opacity-55" />
}

export interface FgDataTableProps<TData> {
  className?: string
  columns: ColumnDef<TData>[]
  data: TData[]
  emptyState?: ReactNode
  enableSortingRemoval?: boolean
  header?: ReactNode
  isRowSelected?: (row: TData) => boolean
  manualSorting?: boolean
  onRowClick?: (row: TData) => void
  onSortingChange?: (sorting: SortingState) => void
  rowClassName?: (row: TData) => string | undefined
  sorting?: SortingState
}

export function FgDataTable<TData>({
  className,
  columns,
  data,
  emptyState,
  enableSortingRemoval = true,
  header,
  isRowSelected,
  manualSorting = false,
  onRowClick,
  onSortingChange,
  rowClassName,
  sorting,
}: FgDataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const currentSorting = sorting ?? internalSorting
  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextSorting = typeof updater === 'function' ? updater(currentSorting) : updater

    if (onSortingChange) {
      onSortingChange(nextSorting)
      return
    }

    setInternalSorting(nextSorting)
  }

  const table = useReactTable({
    columns,
    data,
    defaultColumn: { enableSorting: false },
    enableSortingRemoval,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting,
    onSortingChange: handleSortingChange,
    state: { sorting: currentSorting },
  })

  const rows = table.getRowModel().rows
  const columnCount = table.getVisibleLeafColumns().length

  return (
    <FgTableContainer className={className}>
      {header ? (
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5 text-label text-muted">
          {header}
        </div>
      ) : null}
      <div className="overflow-x-auto fg-scrollbar">
        <FgTable>
          <FgTableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta
                  const canSort = header.column.getCanSort()

                  return (
                    <FgTableHead
                      key={header.id}
                      className={cn(
                        meta?.align && alignClasses[meta.align],
                        canSort && 'cursor-pointer select-none',
                        meta?.headClassName,
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          meta?.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort ? <SortIcon direction={header.column.getIsSorted()} /> : null}
                      </span>
                    </FgTableHead>
                  )
                })}
              </tr>
            ))}
          </FgTableHeader>
          <FgTableBody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  {emptyState ?? <FgEmptyState title="조회 결과가 없습니다" description="검색어 또는 필터를 변경해 보세요" />}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <FgTableRow
                  key={row.id}
                  className={cn(onRowClick && 'cursor-pointer', rowClassName?.(row.original))}
                  data-testid="fg-data-table-row"
                  selected={isRowSelected?.(row.original) ?? false}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta

                    return (
                      <FgTableCell
                        key={cell.id}
                        className={cn(meta?.align && alignClasses[meta.align], meta?.cellClassName)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </FgTableCell>
                    )
                  })}
                </FgTableRow>
              ))
            )}
          </FgTableBody>
        </FgTable>
      </div>
    </FgTableContainer>
  )
}
