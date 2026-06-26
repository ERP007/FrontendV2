import { Calendar } from 'lucide-react'

import { FgFilterBar, FgFilterResetButton, FgFilterSearch, FgFilterSelect, FgInput } from '@/shared/ui'

import { MOVEMENT_TYPE_LABELS } from '../model/types'
import { LockedWarehouseField } from './StockFilterBar'

import type { MovementFilter } from '../model/types'
import type { StockWarehouseOption } from './StockFilterBar'

const typeOptions = [
  { label: '전체', value: 'ALL' },
  ...(Object.keys(MOVEMENT_TYPE_LABELS) as Array<keyof typeof MOVEMENT_TYPE_LABELS>).map((value) => ({
    label: MOVEMENT_TYPE_LABELS[value],
    value,
  })),
]

export interface MovementFilterBarProps {
  filter: MovementFilter
  /** "창고 : 전체" 옵션 노출 여부. BRANCH 사용자는 자기 창고만 보여야 하므로 false로 숨긴다. */
  includeAllOption?: boolean
  /** BRANCH 사용자의 고정 창고 이름. 있으면 창고 드롭다운 대신 이 이름을 고정 표시한다(선택 불가). */
  lockedWarehouseName?: string | null
  onChange: (filter: MovementFilter) => void
  onReset: () => void
  warehouses: StockWarehouseOption[]
}

export function MovementFilterBar({
  filter,
  includeAllOption = true,
  lockedWarehouseName,
  onChange,
  onReset,
  warehouses,
}: MovementFilterBarProps) {
  const warehouseOptions = [
    ...(includeAllOption ? [{ label: '전체', value: 'ALL' }] : []),
    ...warehouses.map((warehouse) => ({ label: warehouse.name, value: warehouse.code })),
  ]

  return (
    <FgFilterBar actions={<FgFilterResetButton onClick={onReset} />}>
      <FgFilterSearch
        placeholder="부품명 또는 코드"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      {lockedWarehouseName ? (
        <LockedWarehouseField name={lockedWarehouseName} />
      ) : (
        <FgFilterSelect
          className="w-48"
          label="창고"
          options={warehouseOptions}
          value={filter.warehouseCode}
          onValueChange={(value) => onChange({ ...filter, warehouseCode: value })}
        />
      )}
      <FgFilterSelect
        className="w-44"
        label="이동 유형"
        options={typeOptions}
        value={filter.type}
        onValueChange={(value) => onChange({ ...filter, type: value as MovementFilter['type'] })}
      />
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={filter.from}
        onChange={(event) => onChange({ ...filter, from: event.target.value })}
      />
      <span className="text-faint">~</span>
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={filter.to}
        onChange={(event) => onChange({ ...filter, to: event.target.value })}
      />
    </FgFilterBar>
  )
}
