import { zodResolver } from '@hookform/resolvers/zod'
import { Boxes, Check, IdCard } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FgButton, FgInput, FgModal, FgSelect } from '@/shared/ui'

import { stockCreateSchema } from '../model/stock-create-schema'

import type { StockCreateFormValues } from '../model/types'

const FORM_ID = 'stock-create-form'

const UNIT_OPTIONS: { label: string; value: StockCreateFormValues['itemUnit'] }[] = [
  { label: 'EA', value: 'EA' },
  { label: 'BOX', value: 'BOX' },
  { label: 'SET', value: 'SET' },
  { label: 'L', value: 'L' },
]

const emptyValues: StockCreateFormValues = {
  itemName: '',
  itemUnit: 'EA',
  quantity: 0,
  safetyStock: 0,
  sku: '',
  warehouseCode: '',
}

export interface StockCreateWarehouseOption {
  code: string
  name: string
}

export interface StockCreateModalProps {
  onClose: () => void
  onSubmit: (values: StockCreateFormValues) => void
  open: boolean
  submitting?: boolean
  warehouses: StockCreateWarehouseOption[]
}

export function StockCreateModal({
  onClose,
  onSubmit,
  open,
  submitting = false,
  warehouses,
}: StockCreateModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<StockCreateFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(stockCreateSchema),
  })

  useEffect(() => {
    if (open) {
      reset(emptyValues)
    }
  }, [open, reset])

  const warehouseOptions = warehouses.map((warehouse) => ({
    label: warehouse.name,
    value: warehouse.code,
  }))

  return (
    <FgModal
      footer={
        <>
          <FgButton disabled={submitting} onClick={onClose}>
            취소
          </FgButton>
          <FgButton
            form={FORM_ID}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            loading={submitting}
            type="submit"
            variant="primary"
          >
            등록
          </FgButton>
        </>
      }
      open={open}
      size="sm"
      title="재고 추가"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <form className="flex flex-col gap-5" id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <FgInput
          error={errors.sku?.message}
          label="부품 코드"
          leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
          placeholder="예) HMC-EN-00214"
          required
          {...register('sku')}
        />
        <FgInput
          error={errors.itemName?.message}
          label="부품명"
          leftIcon={<Boxes aria-hidden className="h-4 w-4" />}
          placeholder="예) 엔진오일 필터"
          required
          {...register('itemName')}
        />
        <Controller
          control={control}
          name="itemUnit"
          render={({ field }) => (
            <FgSelect
              error={errors.itemUnit?.message}
              label="단위"
              options={UNIT_OPTIONS}
              required
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="warehouseCode"
          render={({ field }) => (
            <FgSelect
              error={errors.warehouseCode?.message}
              label="창고"
              options={warehouseOptions}
              placeholder="창고 선택"
              required
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FgInput
            error={errors.quantity?.message}
            inputClassName="text-right font-bold"
            label="현재고"
            min={0}
            required
            type="number"
            {...register('quantity', { valueAsNumber: true })}
          />
          <FgInput
            error={errors.safetyStock?.message}
            inputClassName="text-right font-bold"
            label="안전재고"
            min={0}
            required
            type="number"
            {...register('safetyStock', { valueAsNumber: true })}
          />
        </div>
      </form>
    </FgModal>
  )
}
