import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Info } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgInput, FgModal, FgSegmentedControl, FgSelect, FgTextarea } from '@/shared/ui'

import { adjustmentFormSchema } from '../model/adjustment-schema'
import {
  ADJUSTMENT_REASON_LABELS,
  ADJUSTMENT_TYPE_LABELS,
  previewAdjustedQuantity,
} from '../model/types'

import type { AdjustmentFormValues, Stock } from '../model/types'

const FORM_ID = 'stock-adjust-form'
const QUICK_STEPS = [1, 10, 50, 100]

const reasonOptions = (Object.keys(ADJUSTMENT_REASON_LABELS) as Array<keyof typeof ADJUSTMENT_REASON_LABELS>).map(
  (value) => ({ label: ADJUSTMENT_REASON_LABELS[value], value }),
)

export interface StockAdjustModalProps {
  onClose: () => void
  onSubmit: (values: AdjustmentFormValues) => void
  open: boolean
  /** 같은 sku의 창고별 재고 행 (창고 선택 옵션 + 현재고 표시용) */
  skuRows: Stock[]
  /** 조정 대상으로 선택된 부품 행 */
  stock: Stock | null
  submitting?: boolean
}

export function StockAdjustModal({
  onClose,
  onSubmit,
  open,
  skuRows,
  stock,
  submitting = false,
}: StockAdjustModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<AdjustmentFormValues>({
    defaultValues: {
      adjustmentType: 'INCREASE',
      note: '',
      quantity: 0,
      warehouseCode: '',
    },
    resolver: zodResolver(adjustmentFormSchema),
  })

  useEffect(() => {
    if (open && stock) {
      reset({
        adjustmentType: 'INCREASE',
        note: '',
        quantity: 0,
        warehouseCode: stock.warehouseCode,
      })
    }
  }, [open, reset, stock])

  const warehouseCode = watch('warehouseCode')
  const adjustmentType = watch('adjustmentType')
  const quantity = watch('quantity')

  const selectedRow = skuRows.find((row) => row.warehouseCode === warehouseCode) ?? stock
  const currentQuantity = selectedRow?.quantity ?? 0
  const expectedQuantity = previewAdjustedQuantity(
    currentQuantity,
    adjustmentType,
    Number.isNaN(quantity) ? 0 : quantity,
  )
  const isNegative = expectedQuantity < 0

  if (!stock) return null

  const warehouseOptions = (skuRows.length > 0 ? skuRows : [stock]).map((row) => ({
    label: row.warehouseName,
    value: row.warehouseCode,
  }))

  const quickSign = adjustmentType === 'DECREASE' ? '−' : '+'

  return (
    <FgModal
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-meta text-faint">
            <Info aria-hidden className="h-3.5 w-3.5" />
            조정은 즉시 반영되며 재고 이력에 기록됩니다.
          </span>
          <span className="flex items-center gap-2">
            <FgButton disabled={submitting} onClick={onClose}>
              취소
            </FgButton>
            <FgButton
              disabled={isNegative || submitting}
              form={FORM_ID}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              loading={submitting}
              type="submit"
              variant="primary"
            >
              조정 저장
            </FgButton>
          </span>
        </div>
      }
      open={open}
      size="md"
      title="재고 조정"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <form className="flex flex-col gap-5" id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <span className="block text-label text-ink-2">
            부품<span className="text-danger"> *</span>
          </span>
          <div className="flex h-11 items-center gap-3 rounded-control border border-line bg-line-soft px-3.5 text-body">
            <span className="font-semibold text-muted">{stock.sku}</span>
            <span className="truncate font-semibold text-ink">{stock.itemName}</span>
          </div>
        </div>

        <Controller
          control={control}
          name="warehouseCode"
          render={({ field }) => (
            <FgSelect
              error={errors.warehouseCode?.message}
              label="창고"
              options={warehouseOptions}
              required
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        <div className="flex items-center justify-between rounded-control bg-background px-4 py-3 text-label">
          <span className="text-muted">현재 재고</span>
          <span className="font-bold text-ink">
            {formatNumber(currentQuantity)} <span className="font-medium text-faint">{stock.itemUnit}</span>
          </span>
        </div>

        <div className="space-y-2">
          <span className="block text-label text-ink-2">
            조정 유형<span className="text-danger"> *</span>
          </span>
          <Controller
            control={control}
            name="adjustmentType"
            render={({ field }) => (
              <FgSegmentedControl
                className="grid-cols-3"
                options={[
                  { label: ADJUSTMENT_TYPE_LABELS.INCREASE, value: 'INCREASE' },
                  { label: ADJUSTMENT_TYPE_LABELS.DECREASE, value: 'DECREASE' },
                  { label: ADJUSTMENT_TYPE_LABELS.ADJUST, value: 'ADJUST' },
                ]}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-2.5">
          <FgInput
            error={errors.quantity?.message}
            inputClassName="text-right font-bold"
            label="수량"
            min={0}
            required
            rightIcon={<span className="text-meta font-semibold text-faint">{stock.itemUnit}</span>}
            type="number"
            {...register('quantity', { valueAsNumber: true })}
          />
          <div className="grid grid-cols-4 gap-2">
            {QUICK_STEPS.map((step) => (
              <FgButton
                key={step}
                size="sm"
                onClick={() =>
                  setValue('quantity', (Number.isNaN(quantity) ? 0 : quantity) + step, {
                    shouldValidate: true,
                  })
                }
              >
                {quickSign}
                {step}
              </FgButton>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'flex items-center justify-between rounded-control px-4 py-3 text-label',
            isNegative ? 'bg-danger-bg text-danger' : 'bg-primary-soft text-primary-strong',
          )}
        >
          <span className="font-medium">조정 후 예상 재고</span>
          <span className="text-body font-bold">
            {formatNumber(expectedQuantity)} <span className="font-medium opacity-70">{stock.itemUnit}</span>
          </span>
        </div>
        {isNegative ? (
          <p className="-mt-3 text-meta font-medium text-danger">
            재고가 음수가 될 수 없습니다. 수량을 확인하세요.
          </p>
        ) : null}

        <Controller
          control={control}
          name="reason"
          render={({ field }) => (
            <FgSelect
              error={errors.reason?.message}
              label="사유"
              options={reasonOptions}
              placeholder="사유 선택"
              required
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        <FgTextarea
          label="메모"
          placeholder="조정 배경 · 근거 · 전표번호 등"
          rows={3}
          {...register('note')}
        />
      </form>
    </FgModal>
  )
}
