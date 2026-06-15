import { ArrowUpDown, RotateCcw, Search } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import type { FgSelectOption } from '@/shared/ui'
import type { ItemFilter, ItemSortKey } from '../model/types'

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
  { label: '활성', value: 'ACTIVE' },
  { label: '비활성', value: 'INACTIVE' },
]

const sortOptions = [
  { label: '부품코드 오름차순', value: 'sku,asc' },
  { label: '부품코드 내림차순', value: 'sku,desc' },
  { label: '부품명 오름차순', value: 'name,asc' },
  { label: '부품명 내림차순', value: 'name,desc' },
  { label: '최근 수정일', value: 'updatedAt,desc' },
  { label: '오래된 수정일', value: 'updatedAt,asc' },
]

export interface ItemFilterBarProps {
  filter: ItemFilter
  isMajorCategoryLoading?: boolean
  isMiddleCategoryLoading?: boolean
  majorCategoryOptions: FgSelectOption[]
  middleCategoryOptions: FgSelectOption[]
  onChange: (filter: ItemFilter) => void
  onReset: () => void
}

export function ItemFilterBar({
  filter,
  isMajorCategoryLoading = false,
  isMiddleCategoryLoading = false,
  majorCategoryOptions,
  middleCategoryOptions,
  onChange,
  onReset,
}: ItemFilterBarProps) {
  const majorOptions = [
    {
      label: isMajorCategoryLoading ? '대분류 불러오는 중' : '대분류 : 전체',
      value: 'ALL',
    },
    ...majorCategoryOptions,
  ]
  const middleOptions = [
    { label: '중분류 : 전체', value: 'ALL' },
    ...middleCategoryOptions,
  ]
  const isMiddleCategoryDisabled = filter.majorCategory === 'ALL' || isMiddleCategoryLoading

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
        className="w-44"
        disabled={isMajorCategoryLoading}
        options={majorOptions}
        value={filter.majorCategory}
        onValueChange={(value) =>
          onChange({ ...filter, majorCategory: value, middleCategory: 'ALL' })
        }
      />
      <FgSelect
        className="w-44"
        disabled={isMiddleCategoryDisabled}
        options={middleOptions}
        value={filter.middleCategory}
        onValueChange={(value) => onChange({ ...filter, middleCategory: value })}
      />
      <FgSelect
        className="w-40"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) => onChange({ ...filter, status: value as ItemFilter['status'] })}
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
      <span className="h-6 w-px bg-line" />
      <FgSelect
        className="w-40"
        leftIcon={<ArrowUpDown aria-hidden className="h-4 w-4" />}
        options={sortOptions}
        value={filter.sort}
        onValueChange={(value) => onChange({ ...filter, sort: value as ItemSortKey })}
      />
    </FgCard>
  )
}
