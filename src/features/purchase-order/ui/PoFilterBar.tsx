import { Calendar, RotateCcw, Search } from 'lucide-react'

import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import { PO_STATUS_LABELS } from '../model/types'

import type { PurchaseOrderFilter, PurchaseOrderStatus, Supplier } from '../model/types'

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
  ...(Object.keys(PO_STATUS_LABELS) as PurchaseOrderStatus[]).map((status) => ({
    label: PO_STATUS_LABELS[status],
    value: status,
  })),
]

export interface PoFilterBarProps {
  filter: PurchaseOrderFilter
  onChange: (filter: PurchaseOrderFilter) => void
  onReset: () => void
  suppliers: Supplier[]
}

export function PoFilterBar({ filter, onChange, onReset, suppliers }: PoFilterBarProps) {
  const supplierOptions = [
    { label: '공급사 : 전체', value: 'ALL' },
    ...suppliers.map((supplier) => ({ label: supplier.name, value: supplier.code })),
  ]

  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder="PO 번호 또는 공급사명"
        rootClassName="flex-1"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgSelect
        className="w-40"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) =>
          onChange({ ...filter, status: value as PurchaseOrderFilter['status'] })
        }
      />
      <FgSelect
        className="w-48"
        options={supplierOptions}
        value={filter.supplierCode}
        onValueChange={(value) => onChange({ ...filter, supplierCode: value })}
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
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
