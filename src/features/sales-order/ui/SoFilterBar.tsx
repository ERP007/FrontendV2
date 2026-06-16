import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Calendar, Check, ChevronDown, RotateCcw, Search } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { FgBadge, FgButton, FgCard, FgInput } from '@/shared/ui'

import { SO_STATUS_LABELS } from '../model/types'

import type { SalesOrderStatus } from '../model/types'

import type { HqWarehouseSummary } from '@/features/warehouse'

const HQ_STATUS_OPTIONS: SalesOrderStatus[] = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'DELIVERED',
  'CANCELED',
]

export interface SoFilterBarValues {
  endDate?: string
  search: string
  startDate?: string
  status: SalesOrderStatus[]
  warehouseCode?: string
}

export interface SoFilterBarProps {
  onChange: (next: SoFilterBarValues) => void
  onReset: () => void
  searchPlaceholder?: string
  values: SoFilterBarValues
  warehouses?: HqWarehouseSummary[]
}

export function SoFilterBar({
  onChange,
  onReset,
  searchPlaceholder = '요청번호, 부품명·코드, 지점명 검색',
  values,
  warehouses,
}: SoFilterBarProps) {
  const statusCount = values.status.length

  function toggleStatus(status: SalesOrderStatus) {
    const next = values.status.includes(status)
      ? values.status.filter((item) => item !== status)
      : [...values.status, status]
    onChange({ ...values, status: next })
  }

  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder={searchPlaceholder}
        rootClassName="flex-1"
        value={values.search}
        onChange={(event) => onChange({ ...values, search: event.target.value })}
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
                    {values.status.map((status) => SO_STATUS_LABELS[status]).join(', ')}
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
            {HQ_STATUS_OPTIONS.map((status) => {
              const checked = values.status.includes(status)
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
                  <span>{SO_STATUS_LABELS[status]}</span>
                  {checked ? <Check aria-hidden className="h-4 w-4 text-primary" /> : null}
                </DropdownMenu.CheckboxItem>
              )
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {warehouses ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <FgButton
              className="w-40 justify-between"
              rightIcon={<ChevronDown aria-hidden className="h-4 w-4" />}
            >
              <span className="flex items-center gap-2 truncate">
                창고
                {values.warehouseCode ? (
                  <span className="truncate text-meta text-muted">{values.warehouseCode}</span>
                ) : (
                  <span className="text-meta text-faint">전체</span>
                )}
              </span>
            </FgButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              className="z-50 min-w-56 rounded-control bg-surface/95 p-1 shadow-popover backdrop-blur focus:outline-none"
              sideOffset={6}
            >
              <DropdownMenu.RadioGroup
                value={values.warehouseCode ?? ''}
                onValueChange={(value) =>
                  onChange({ ...values, warehouseCode: value || undefined })
                }
              >
                <DropdownMenu.RadioItem
                  className={cn(
                    'flex min-h-10 cursor-pointer select-none items-center justify-between gap-3 rounded-control px-3 py-2 text-label font-semibold text-ink-2 outline-none',
                    'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
                  )}
                  value=""
                >
                  <span>전체</span>
                  {!values.warehouseCode ? <Check aria-hidden className="h-4 w-4 text-primary" /> : null}
                </DropdownMenu.RadioItem>
                {warehouses.map((warehouse) => (
                  <DropdownMenu.RadioItem
                    key={warehouse.id}
                    className={cn(
                      'flex min-h-10 cursor-pointer select-none items-center justify-between gap-3 rounded-control px-3 py-2 text-label font-semibold text-ink-2 outline-none',
                      'data-[highlighted]:bg-primary-soft data-[highlighted]:text-primary-strong',
                    )}
                    value={warehouse.code}
                  >
                    <span className="flex flex-col">
                      <span>{warehouse.name}</span>
                      <span className="text-meta font-medium text-faint">{warehouse.code}</span>
                    </span>
                    {values.warehouseCode === warehouse.code ? (
                      <Check aria-hidden className="h-4 w-4 text-primary" />
                    ) : null}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : null}
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={values.startDate ?? ''}
        onChange={(event) =>
          onChange({ ...values, startDate: event.target.value || undefined })
        }
      />
      <span className="text-faint">~</span>
      <FgInput
        leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
        rootClassName="w-44"
        type="date"
        value={values.endDate ?? ''}
        onChange={(event) => onChange({ ...values, endDate: event.target.value || undefined })}
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
