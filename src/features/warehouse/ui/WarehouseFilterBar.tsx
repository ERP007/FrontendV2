import { FgFilterBar, FgFilterResetButton, FgFilterSearch, FgFilterSelect } from '@/shared/ui'

import type { WarehouseFilter, WarehouseStatusFilter, WarehouseTypeFilter } from '../model/types'

const typeOptions = [
  { label: '전체', value: 'ALL' },
  { label: 'HQ (본사)', value: 'HQ' },
  { label: 'DEALER (지점)', value: 'DEALER' },
]

const statusOptions = [
  { label: '전체', value: 'ALL' },
  { label: '활성', value: 'ACTIVE' },
  { label: '비활성', value: 'INACTIVE' },
]

export interface WarehouseFilterBarProps {
  filter: WarehouseFilter
  onChange: (filter: WarehouseFilter) => void
  onReset: () => void
}

export function WarehouseFilterBar({ filter, onChange, onReset }: WarehouseFilterBarProps) {
  return (
    <FgFilterBar actions={<FgFilterResetButton onClick={onReset} />}>
      <FgFilterSearch
        placeholder="창고명 또는 코드"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgFilterSelect
        className="w-44"
        label="유형"
        options={typeOptions}
        value={filter.type}
        onValueChange={(value) => onChange({ ...filter, type: value as WarehouseTypeFilter })}
      />
      <FgFilterSelect
        className="w-40"
        label="상태"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) => onChange({ ...filter, status: value as WarehouseStatusFilter })}
      />
    </FgFilterBar>
  )
}
