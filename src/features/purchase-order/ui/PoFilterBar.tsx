import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Calendar, Check, ChevronDown, RotateCcw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgBadge, FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

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
  const [searchInput, setSearchInput] = useState(params.search ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  useEffect(() => {
    setSearchInput(params.search ?? '')
  }, [params.search])

  useEffect(() => {
    const next = debouncedSearch || undefined
    if (next === params.search) return
    onChange({ ...params, page: 1, search: next })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const selectedStatuses = parseStatusCsv(params.status)
  const statusCount = selectedStatuses.length

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
    { label: '공급사 : 전체', value: VENDOR_ALL },
    ...vendors.map((vendor) => ({ label: vendor.name, value: vendor.code })),
  ]

  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder="PO 번호 또는 공급사명"
        rootClassName="flex-1"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <FgButton
            className="w-40 justify-between"
            rightIcon={<ChevronDown aria-hidden className="h-4 w-4" />}
          >
            <span className="flex items-center gap-2 truncate">
              상태
              {statusCount > 0 ? (
                <>
                  <FgBadge variant="primary">{statusCount}</FgBadge>
                  <span className="truncate text-meta text-muted">
                    {selectedStatuses.map((s) => PO_STATUS_LABELS[s]).join(', ')}
                  </span>
                </>
              ) : (
                <span className="text-meta text-faint">전체</span>
              )}
            </span>
          </FgButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            className="z-50 min-w-48 rounded-control bg-surface/95 p-1 shadow-popover backdrop-blur focus:outline-none"
            sideOffset={6}
          >
            {STATUS_ORDER.map((status) => {
              const checked = selectedStatuses.includes(status)
              return (
                <DropdownMenu.CheckboxItem
                  key={status}
                  checked={checked}
                  className={cn(
                    'flex min-h-10 cursor-pointer select-none items-center justify-between gap-3 rounded-control px-3 py-2 text-label font-semibold text-ink-2 outline-none',
                    'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
                  )}
                  onSelect={(event) => {
                    event.preventDefault()
                    toggleStatus(status)
                  }}
                >
                  <span>{PO_STATUS_LABELS[status]}</span>
                  {checked ? <Check aria-hidden className="h-4 w-4 text-primary" /> : null}
                </DropdownMenu.CheckboxItem>
              )
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <FgSelect
        className="w-48"
        options={vendorOptions}
        value={params.vendorCode ?? VENDOR_ALL}
        onValueChange={(value) =>
          update({ vendorCode: value === VENDOR_ALL ? undefined : value })
        }
      />
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={params.startDate ?? ''}
        onChange={(event) => update({ startDate: event.target.value || undefined })}
      />
      <span className="text-faint">~</span>
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={params.endDate ?? ''}
        onChange={(event) => update({ endDate: event.target.value || undefined })}
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
