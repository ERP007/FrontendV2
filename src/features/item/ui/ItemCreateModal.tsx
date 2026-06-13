import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CircleDollarSign, IdCard, Info, Package } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { FgButton, FgInput, FgModal, FgSelect } from '@/shared/ui'
import type { FgSelectOption } from '@/shared/ui'

import { itemFormSchema } from '../model/item-schema'
import { ITEM_UNIT_OPTIONS } from '../model/types'

import type { ItemFormValues } from '../model/types'

const FORM_ID = 'item-create-form'

const unitOptions = ITEM_UNIT_OPTIONS.map((unit) => ({ label: unit, value: unit }))

const emptyValues: ItemFormValues = {
  categoryCode: '',
  majorCategory: '',
  name: '',
  safetyStock: 0,
  sku: '',
  unit: 'EA',
  unitPrice: 0,
}

export interface ItemCreateModalProps {
  isMajorCategoryLoading?: boolean
  isMiddleCategoryFetched?: boolean
  isMiddleCategoryLoading?: boolean
  majorCategoryOptions: FgSelectOption[]
  middleCategoryOptions: FgSelectOption[]
  onClose: () => void
  onMajorCategoryChange: (categoryCode: string) => void
  onSubmit: (values: ItemFormValues) => Promise<void> | void
  open: boolean
}

export function ItemCreateModal({
  isMajorCategoryLoading = false,
  isMiddleCategoryFetched = false,
  isMiddleCategoryLoading = false,
  majorCategoryOptions,
  middleCategoryOptions,
  onClose,
  onMajorCategoryChange,
  onSubmit,
  open,
}: ItemCreateModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<ItemFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(itemFormSchema),
  })

  useEffect(() => {
    if (open) {
      reset(emptyValues)
      onMajorCategoryChange('')
    }
  }, [onMajorCategoryChange, open, reset])

  const majorCategory = useWatch({ control, name: 'majorCategory' })
  const unit = useWatch({ control, name: 'unit' })
  const hasNoMiddleCategories =
    Boolean(majorCategory) &&
    isMiddleCategoryFetched &&
    !isMiddleCategoryLoading &&
    middleCategoryOptions.length === 0
  const middleOptions = hasNoMiddleCategories && majorCategory
    ? [{ disabled: true, label: '중분류 없음', value: majorCategory }]
    : middleCategoryOptions
  const isMiddleCategoryDisabled = !majorCategory || isMiddleCategoryLoading || hasNoMiddleCategories

  useEffect(() => {
    if (hasNoMiddleCategories && majorCategory) {
      setValue('categoryCode', majorCategory, { shouldValidate: true })
    }
  }, [hasNoMiddleCategories, majorCategory, setValue])

  return (
    <FgModal
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-meta text-faint">
            <Info aria-hidden className="h-3.5 w-3.5" />
            등록 후 재고 조회(IV-01)에서 창고별 재고를 추가합니다.
          </span>
          <span className="flex items-center gap-2">
            <FgButton onClick={onClose}>취소</FgButton>
            <FgButton
              form={FORM_ID}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              type="submit"
              variant="primary"
            >
              등록
            </FgButton>
          </span>
        </div>
      }
      open={open}
      size="lg"
      title="부품 추가"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <form className="grid grid-cols-2 gap-x-6 gap-y-5" id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
        <FgInput
          error={errors.sku?.message}
          inputClassName="font-semibold"
          label="부품 코드"
          leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
          placeholder="HMC-XX-00000"
          required
          {...register('sku')}
        />
        <FgInput
          error={errors.name?.message}
          label="부품명"
          leftIcon={<Package aria-hidden className="h-4 w-4" />}
          placeholder="예) 엔진오일 필터 (2.0L gasoline)"
          required
          {...register('name')}
        />
        <Controller
          control={control}
          name="majorCategory"
          render={({ field }) => (
            <FgSelect
              error={errors.majorCategory?.message}
              disabled={isMajorCategoryLoading}
              label="분류 — 대분류"
              options={majorCategoryOptions}
              placeholder={isMajorCategoryLoading ? '대분류 불러오는 중' : '대분류 선택'}
              required
              value={field.value || undefined}
              onValueChange={(value) => {
                field.onChange(value)
                setValue('categoryCode', '', { shouldValidate: false })
                onMajorCategoryChange(value)
              }}
            />
          )}
        />
        <Controller
          control={control}
          name="categoryCode"
          render={({ field }) => (
            <FgSelect
              disabled={isMiddleCategoryDisabled}
              error={errors.categoryCode?.message}
              hint={!majorCategory ? '대분류 선택 후 활성화됩니다.' : undefined}
              label="분류 — 중분류"
              options={middleOptions}
              placeholder={
                isMiddleCategoryLoading
                  ? '중분류 불러오는 중'
                  : hasNoMiddleCategories
                    ? '중분류 없음'
                    : '중분류 선택'
              }
              required
              value={field.value || undefined}
              onValueChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="unit"
          render={({ field }) => (
            <FgSelect
              error={errors.unit?.message}
              label="단위"
              options={unitOptions}
              required
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
        <FgInput
          error={errors.safetyStock?.message}
          inputClassName="text-right font-bold"
          label="안전재고 기본"
          min={0}
          required
          rightIcon={<span className="text-meta font-semibold text-faint">{unit}</span>}
          step={1}
          type="number"
          {...register('safetyStock', { valueAsNumber: true })}
        />
        <FgInput
          error={errors.unitPrice?.message}
          inputClassName="text-right font-bold"
          label="단가"
          leftIcon={<CircleDollarSign aria-hidden className="h-4 w-4" />}
          min={0}
          required
          rightIcon={<span className="text-meta font-semibold text-faint">원</span>}
          rootClassName="col-start-2"
          step={1}
          type="number"
          {...register('unitPrice', { valueAsNumber: true })}
        />
      </form>
    </FgModal>
  )
}
