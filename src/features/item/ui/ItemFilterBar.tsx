import { ArrowUpDown } from 'lucide-react'

import {
  FgFilterBar,
  FgFilterResetButton,
  FgFilterSearch,
  FgFilterSelect,
  FgSelect,
} from '@/shared/ui'

import type { FgSelectOption } from '@/shared/ui'
import type { ItemFilter, ItemSortKey } from '../model/types'

const statusOptions = [
  { label: '전체', value: 'ALL' },
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
      label: isMajorCategoryLoading ? '불러오는 중' : '전체',
      value: 'ALL',
    },
    ...majorCategoryOptions,
  ]
  const middleOptions = [
    { label: '전체', value: 'ALL' },
    ...middleCategoryOptions,
  ]
  const isMiddleCategoryDisabled = filter.majorCategory === 'ALL' || isMiddleCategoryLoading

  return (
    <FgFilterBar
      actions={
        <>
          <FgFilterResetButton className="shrink-0" onClick={onReset} />
          <span className="hidden h-6 w-px shrink-0 bg-line sm:block" />
          <FgSelect
            className="w-64 shrink-0"
            leftIcon={<ArrowUpDown aria-hidden className="h-4 w-4" />}
            options={sortOptions}
            value={filter.sort}
            onValueChange={(value) => onChange({ ...filter, sort: value as ItemSortKey })}
          />
        </>
      }
    >
      <FgFilterSearch
        placeholder="부품명 또는 코드"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgFilterSelect
        className="w-44 shrink-0"
        disabled={isMajorCategoryLoading}
        label="대분류"
        options={majorOptions}
        value={filter.majorCategory}
        onValueChange={(value) =>
          onChange({ ...filter, majorCategory: value, middleCategory: 'ALL' })
        }
      />
      <FgFilterSelect
        className="w-44 shrink-0"
        disabled={isMiddleCategoryDisabled}
        label="중분류"
        options={middleOptions}
        value={filter.middleCategory}
        onValueChange={(value) => onChange({ ...filter, middleCategory: value })}
      />
      <FgFilterSelect
        className="w-40 shrink-0"
        label="상태"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) => onChange({ ...filter, status: value as ItemFilter['status'] })}
      />
    </FgFilterBar>
  )
}
