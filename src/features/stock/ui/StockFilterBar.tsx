import { ArrowUpDown, RotateCcw, Search } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import type { StockFilter, StockSortKey } from '../model/types'

const statusOptions = [
  { label: '재고 상태 : 전체', value: 'ALL' },
  { label: '충분', value: 'NORMAL' },
  { label: '부족', value: 'LOW' },
  { label: '재고 없음', value: 'OUT' },
]

const sortOptions = [
  { label: '안전재고 대비', value: 'safetyRatio' },
  { label: '부품명순', value: 'name' },
  { label: '수량 많은순', value: 'quantity' },
  { label: '최근 조정일순', value: 'lastAdjustedAt' },
]

export interface StockWarehouseOption {
  code: string
  name: string
}

export interface StockFilterBarProps {
  filter: StockFilter
  /** "창고 : 전체" 옵션 노출 여부. BRANCH 사용자는 자기 창고만 보여야 하므로 false로 숨긴다. */
  includeAllOption?: boolean
  onChange: (filter: StockFilter) => void
  onReset: () => void
  warehouses: StockWarehouseOption[]
}

export function StockFilterBar({
  filter,
  includeAllOption = true,
  onChange,
  onReset,
  warehouses,
}: StockFilterBarProps) {
  const warehouseOptions = [
    ...(includeAllOption ? [{ label: '창고 : 전체', value: 'ALL' }] : []),
    ...warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse.code })),
  ]

  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder="부품명 또는 코드"
        rootClassName="flex-1"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgSelect
        className="w-48"
        options={warehouseOptions}
        value={filter.warehouseCode}
        onValueChange={(value) => onChange({ ...filter, warehouseCode: value })}
      />
      <FgSelect
        className="w-44"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) => onChange({ ...filter, status: value as StockFilter['status'] })}
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
      <span className="h-6 w-px bg-line" />
      <FgSelect
        className="w-44"
        leftIcon={<ArrowUpDown aria-hidden className="h-4 w-4" />}
        options={sortOptions}
        value={filter.sort}
        onValueChange={(value) => onChange({ ...filter, sort: value as StockSortKey })}
      />
    </FgCard>
  )
}
