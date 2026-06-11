import { ArrowUpDown, RotateCcw, Search } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import { ITEM_CATEGORIES } from '../model/types'

import type { ItemFilter, ItemSortKey } from '../model/types'

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
  { label: '활성', value: 'ACTIVE' },
  { label: '비활성', value: 'INACTIVE' },
]

const sortOptions = [
  { label: '최근 수정일', value: 'updatedAt' },
  { label: '부품 코드', value: 'code' },
]

const majorOptions = [
  { label: '대분류 : 전체', value: 'ALL' },
  ...Object.keys(ITEM_CATEGORIES).map((major) => ({ label: major, value: major })),
]

export interface ItemFilterBarProps {
  filter: ItemFilter
  onChange: (filter: ItemFilter) => void
  onReset: () => void
}

export function ItemFilterBar({ filter, onChange, onReset }: ItemFilterBarProps) {
  const middleOptions = [
    { label: '중분류 : 전체', value: 'ALL' },
    ...(filter.majorCategory === 'ALL'
      ? []
      : (ITEM_CATEGORIES[filter.majorCategory] ?? []).map((middle) => ({
          label: middle,
          value: middle,
        }))),
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
        className="w-44"
        options={majorOptions}
        value={filter.majorCategory}
        onValueChange={(value) =>
          onChange({ ...filter, majorCategory: value, middleCategory: 'ALL' })
        }
      />
      <FgSelect
        className="w-44"
        disabled={filter.majorCategory === 'ALL'}
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
