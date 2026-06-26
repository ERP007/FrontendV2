import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import {
  FgFilterBar,
  FgFilterChips,
  FgFilterResetButton,
  FgFilterSearch,
  FgFilterSelect,
  FgInput,
} from '@/shared/ui'

const DATE_INPUT_CLASSNAME =
  'appearance-none bg-transparent shadow-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit]:outline-none [&::-webkit-datetime-edit]:border-0 [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none focus:!outline-none focus:!shadow-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0'

function openDatePicker(event: { currentTarget: HTMLInputElement }) {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void }
  input.showPicker?.()
}

import { PO_STATUS_LABELS } from '../model/po-list-row'
import type {
  PurchaseOrderStatus,
  SearchPurchaseOrderRequest,
  VendorResponse,
} from '../model/types'

const VENDOR_ALL = 'ALL'

const STATUS_ORDER: PurchaseOrderStatus[] = ['DRAFT', 'APPROVED', 'RECEIVED', 'CANCELED']

function parseStatusCsv(csv: string | undefined): PurchaseOrderStatus[] {
  if (!csv) return []
  return csv
    .split(',')
    .map((s) => s.trim() as PurchaseOrderStatus)
    .filter((s) => STATUS_ORDER.includes(s))
}

function joinStatuses(statuses: PurchaseOrderStatus[]): string | undefined {
  if (statuses.length === 0) return undefined
  return STATUS_ORDER.filter((status) => statuses.includes(status)).join(',')
}

export interface PoFilterBarProps {
  onChange: (next: SearchPurchaseOrderRequest) => void
  onReset: () => void
  params: SearchPurchaseOrderRequest
  vendors?: VendorResponse[]
}

export function PoFilterBar({ onChange, onReset, params, vendors = [] }: PoFilterBarProps) {
  const paramsSearch = params.search ?? ''
  const [searchState, setSearchState] = useState({ input: paramsSearch, paramsSearch })
  const searchInput = searchState.paramsSearch === paramsSearch ? searchState.input : paramsSearch
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next === params.search) return
    onChange({ ...params, page: 1, search: next })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const selectedStatuses = parseStatusCsv(params.status)

  function update(patch: Partial<SearchPurchaseOrderRequest>) {
    onChange({ ...params, ...patch, page: 1 })
  }

  function toggleStatus(status: PurchaseOrderStatus) {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]
    update({ status: joinStatuses(next) })
  }

  const vendorOptions = [
    { label: '전체', value: VENDOR_ALL },
    ...vendors.map((vendor) => ({ label: vendor.name, value: vendor.code })),
  ]

  const statusOptions = STATUS_ORDER.map((status) => ({
    label: PO_STATUS_LABELS[status],
    value: status,
  }))

  return (
    <FgFilterBar>
      <FgFilterSearch
        placeholder="요청번호 또는 공급사명"
        value={searchInput}
        onChange={(event) => setSearchState({ input: event.target.value, paramsSearch })}
      />
      <FgFilterSelect
        className="w-48"
        label="공급사"
        options={vendorOptions}
        value={params.vendorCode || undefined}
        onValueChange={(value) =>
          update({ vendorCode: value === VENDOR_ALL ? undefined : value })
        }
      />
      <FgInput
        inputClassName={DATE_INPUT_CLASSNAME}
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={params.startDate ?? ''}
        onChange={(event) => update({ startDate: event.target.value || undefined })}
        onClick={openDatePicker}
      />
      <span className="text-faint">~</span>
      <FgInput
        inputClassName={DATE_INPUT_CLASSNAME}
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={params.endDate ?? ''}
        onChange={(event) => update({ endDate: event.target.value || undefined })}
        onClick={openDatePicker}
      />
      <FgFilterResetButton onClick={onReset} />
      <FgFilterChips
        label="상태"
        options={statusOptions}
        selected={selectedStatuses}
        onToggle={toggleStatus}
      />
    </FgFilterBar>
  )
}
