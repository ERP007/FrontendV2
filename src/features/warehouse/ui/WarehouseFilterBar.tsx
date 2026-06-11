import { RotateCcw, Search } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import type { WarehouseFilter, WarehouseStatusFilter, WarehouseTypeFilter } from '../model/types'

const typeOptions = [
  { label: '유형 : 전체', value: 'ALL' },
  { label: 'HQ (본사)', value: 'HQ' },
  { label: 'DEALER (지점)', value: 'DEALER' },
]

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
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
    <FgCard className="flex items-center gap-3 p-4" compact={false}>
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder="창고명 또는 코드"
        rootClassName="flex-1"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgSelect
        className="w-44"
        options={typeOptions}
        value={filter.type}
        onValueChange={(value) => onChange({ ...filter, type: value as WarehouseTypeFilter })}
      />
      <FgSelect
        className="w-40"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) => onChange({ ...filter, status: value as WarehouseStatusFilter })}
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
