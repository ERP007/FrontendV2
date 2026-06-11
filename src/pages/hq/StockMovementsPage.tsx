import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  createDefaultMovementFilter,
  filterMovements,
  groupMovementsByDate,
  MOVEMENT_FIXTURES,
  MovementFilterBar,
  MovementTable,
} from '@/features/stock'
import type { MovementFilter } from '@/features/stock'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '물류 관리' }, { label: '재고' }, { label: '재고 이력' }]

export function StockMovementsPage() {
  const [filter, setFilter] = useState<MovementFilter>(createDefaultMovementFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filtered = useMemo(() => filterMovements(MOVEMENT_FIXTURES, filter), [filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const groups = useMemo(() => groupMovementsByDate(pageRows), [pageRows])

  const warehouseOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const movement of MOVEMENT_FIXTURES) {
      if (!seen.has(movement.warehouseCode)) seen.set(movement.warehouseCode, movement.warehouseName)
    }
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }))
  }, [])

  function handleFilterChange(next: MovementFilter) {
    setFilter(next)
    setPage(1)
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <FgButton
            leftIcon={<Download aria-hidden className="h-4 w-4" />}
            onClick={() => toast.info('CSV 내보내기는 백엔드 연동 후 제공됩니다.')}
          >
            CSV 내보내기
          </FgButton>
        }
        breadcrumbs={breadcrumbs}
        title="재고 이력"
      />
      <MovementFilterBar
        filter={filter}
        warehouses={warehouseOptions}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(createDefaultMovementFilter())}
      />
      <MovementTable
        groups={groups}
        totalCount={filtered.length}
        onRefresh={() => toast.success('최신 이력입니다.')}
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[20, 50, 100]}
        totalCount={filtered.length}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
