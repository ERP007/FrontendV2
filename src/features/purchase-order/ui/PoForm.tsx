import { Building2, Calendar } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller } from 'react-hook-form'
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form'

import { formatCurrency } from '@/shared/lib/format'
import { FgCard, FgInput, FgNotice, FgSelect, FgTextarea } from '@/shared/ui'

import { draftLineAmount } from '../model/ui-types'
import type { PoDraftLine } from '../model/ui-types'
import type { PurchaseOrderDraftFormValues } from '../model/po-schema'
import { PoLineEditor } from './PoLineEditor'
import type { PoLineSearchPanelProps } from './PoLineEditor'
import { VendorPicker } from './VendorPicker'

const DATE_INPUT_CLASSNAME =
  'appearance-none bg-transparent shadow-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit]:outline-none [&::-webkit-datetime-edit]:border-0 [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none focus:!outline-none focus:!shadow-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0'

export interface PoFormWarehouseOption {
  code: string
  name: string
}

export interface PoFormProps {
  assigneeLabel: string
  control: Control<PurchaseOrderDraftFormValues>
  errors: FieldErrors<PurchaseOrderDraftFormValues>
  /** 수정 시 이미 선택된 공급사명을 prefill 표시 */
  initialVendorName?: string
  lineError: string | null
  lines: PoDraftLine[]
  onLinesChange: (lines: PoDraftLine[]) => void
  register: UseFormRegister<PurchaseOrderDraftFormValues>
  renderSearchPanel: (props: PoLineSearchPanelProps) => ReactNode
  warehouses: PoFormWarehouseOption[] | undefined
  watch: UseFormWatch<PurchaseOrderDraftFormValues>
}

export function PoForm({
  assigneeLabel,
  control,
  errors,
  initialVendorName,
  lineError,
  lines,
  onLinesChange,
  register,
  renderSearchPanel,
  warehouses,
  watch,
}: PoFormProps) {
  const totalAmount = lines.reduce((sum, line) => sum + draftLineAmount(line), 0)

  return (
    <>
      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">주문 정보</h2>
          <span className="text-meta font-medium text-faint">담당자 · {assigneeLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Controller
            control={control}
            name="vendorCode"
            render={({ field }) => (
              <VendorPicker
                error={errors.vendorCode?.message}
                initialName={initialVendorName}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FgInput
            error={errors.desiredArrivalDate?.message}
            inputClassName={DATE_INPUT_CLASSNAME}
            label="도착 예정일"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            {...register('desiredArrivalDate')}
            onClick={(event) => {
              const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void }
              input.showPicker?.()
            }}
          />
          <Controller
            control={control}
            name="warehouseCode"
            render={({ field }) => (
              <FgSelect
                className="[&_[data-placeholder]]:text-faint"
                error={errors.warehouseCode?.message}
                label="납품 창고"
                leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
                options={
                  warehouses?.map((warehouse) => ({
                    label: warehouse.name,
                    supportingText: warehouse.code,
                    value: warehouse.code,
                  })) ?? []
                }
                placeholder="납품 창고 선택"
                required
                value={field.value || undefined}
                onValueChange={field.onChange}
              />
            )}
          />
          <FgTextarea
            error={errors.memo?.message}
            label="메모"
            labelTrailing={`${(watch('memo') ?? '').length} / 500`}
            maxLength={500}
            placeholder="배송 요청사항, 결제 조건 등"
            rows={3}
            {...register('memo')}
          />
        </div>
      </FgCard>

      <PoLineEditor
        lines={lines}
        renderSearchPanel={renderSearchPanel}
        onChange={onLinesChange}
      />
      {lineError ? <FgNotice tone="danger">{lineError}</FgNotice> : null}

      <FgCard className="flex items-center justify-end gap-4" compact>
        <span className="text-label font-medium text-muted">총 금액 (VAT 별도)</span>
        <span className="text-h1 text-primary-strong">{formatCurrency(totalAmount)}</span>
      </FgCard>
    </>
  )
}
