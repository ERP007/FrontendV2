import { Calendar, RotateCcw, Search } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import { SO_STATUS_LABELS } from '../model/types'

import type { SalesOrderFilter, SalesOrderStatus } from '../model/types'

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
  ...(Object.keys(SO_STATUS_LABELS) as SalesOrderStatus[]).map((status) => ({
    label: SO_STATUS_LABELS[status],
    value: status,
  })),
]

export interface SoBranchOption {
  code: string
  name: string
}

export interface SoFilterBarProps {
  /** 지점 옵션이 있으면 지점 셀렉트 표시 (본사 화면용) */
  branches?: SoBranchOption[]
  filter: SalesOrderFilter
  onChange: (filter: SalesOrderFilter) => void
  onReset: () => void
  searchPlaceholder?: string
}

export function SoFilterBar({
  branches,
  filter,
  onChange,
  onReset,
  searchPlaceholder = '요청번호, 부품명·코드, 지점명 검색',
}: SoFilterBarProps) {
  const branchOptions = branches
    ? [
        { label: '지점 : 전체', value: 'ALL' },
        ...branches.map((branch) => ({ label: branch.name, value: branch.code })),
      ]
    : null

  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder={searchPlaceholder}
        rootClassName="flex-1"
        value={filter.search}
        onChange={(event) => onChange({ ...filter, search: event.target.value })}
      />
      <FgSelect
        className="w-40"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) =>
          onChange({ ...filter, status: value as SalesOrderFilter['status'] })
        }
      />
      {branchOptions ? (
        <FgSelect
          className="w-48"
          options={branchOptions}
          value={filter.branchCode}
          onValueChange={(value) => onChange({ ...filter, branchCode: value })}
        />
      ) : null}
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={filter.startDate}
        onChange={(event) => onChange({ ...filter, startDate: event.target.value })}
      />
      <span className="text-faint">~</span>
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={filter.endDate}
        onChange={(event) => onChange({ ...filter, endDate: event.target.value })}
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
