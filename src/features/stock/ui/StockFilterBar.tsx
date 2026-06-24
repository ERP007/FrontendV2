import { ArrowDownNarrowWide, RotateCcw, Search, Warehouse } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import type { StockFilter } from '../model/types'

const statusOptions = [
  { label: '재고 상태 : 전체', value: 'ALL' },
  { label: '충분', value: 'NORMAL' },
  { label: '부족', value: 'LOW' },
]

export interface StockWarehouseOption {
  code: string
  name: string
}

export interface StockFilterBarProps {
  filter: StockFilter
  /** "창고 : 전체" 옵션 노출 여부. BRANCH 사용자는 자기 창고만 보여야 하므로 false로 숨긴다. */
  includeAllOption?: boolean
  /** BRANCH 사용자의 고정 창고 이름. 있으면 창고 드롭다운 대신 이 이름을 고정 표시한다(선택 불가). */
  lockedWarehouseName?: string | null
  onChange: (filter: StockFilter) => void
  onReset: () => void
  /** '안전재고 대비' 정렬(비율 낮은 순)을 적용한다. 헤더 정렬 중이면 버튼은 비활성으로 표시된다. */
  onSafetyRatioSort: () => void
  /** 현재 정렬이 '안전재고 대비'면 true(버튼 활성 표시). */
  safetyRatioActive: boolean
  warehouses: StockWarehouseOption[]
}

/** BRANCH 사용자용 고정 창고 표시. 드롭다운 대신 자기 창고 이름을 비활성 필드로 보여준다(MovementFilterBar 공용). */
export function LockedWarehouseField({ name }: { name: string }) {
  return (
    <div className="flex h-10 w-48 items-center gap-2 rounded-control border border-line bg-line-soft px-3 text-label text-ink">
      <Warehouse aria-hidden className="h-4 w-4 text-faint" />
      <span className="truncate">{name}</span>
    </div>
  )
}

export function StockFilterBar({
  filter,
  includeAllOption = true,
  lockedWarehouseName,
  onChange,
  onReset,
  onSafetyRatioSort,
  safetyRatioActive,
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
      {lockedWarehouseName ? (
        <LockedWarehouseField name={lockedWarehouseName} />
      ) : (
        <FgSelect
          className="w-48"
          options={warehouseOptions}
          value={filter.warehouseCode}
          onValueChange={(value) => onChange({ ...filter, warehouseCode: value })}
        />
      )}
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
      <FgButton
        aria-pressed={safetyRatioActive}
        leftIcon={<ArrowDownNarrowWide aria-hidden className="h-4 w-4" />}
        variant={safetyRatioActive ? 'soft' : 'default'}
        onClick={onSafetyRatioSort}
      >
        안전재고 대비
      </FgButton>
    </FgCard>
  )
}
