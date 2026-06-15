import { zodResolver } from '@hookform/resolvers/zod'
import { Check, CircleDollarSign, IdCard, Info, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { FgButton, FgInput, FgModal, FgNotice, FgSelect } from '@/shared/ui'
import type { FgSelectOption } from '@/shared/ui'

import { getItemErrorDetail } from '../model/item-error-policy'
import { itemFormSchema } from '../model/item-schema'

import type { ItemFormValues, ItemSkuCheckResult } from '../model/types'

const FORM_ID = 'item-create-form'

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
  formError?: string | null
  isMajorCategoryLoading?: boolean
  isMiddleCategoryFetched?: boolean
  isMiddleCategoryLoading?: boolean
  isSubmitting?: boolean
  isSkuChecking?: boolean
  isUnitLoading?: boolean
  majorCategoryOptions: FgSelectOption[]
  middleCategoryOptions: FgSelectOption[]
  onClose: () => void
  onMajorCategoryChange: (categoryCode: string) => void
  onSkuCheck: (sku: string) => Promise<ItemSkuCheckResult>
  onSubmit: (values: ItemFormValues) => Promise<void> | void
  open: boolean
  unitOptions: FgSelectOption[]
}

type SkuCheckState =
  | { message: string; sku: string; status: 'available' | 'checking' | 'error' | 'unavailable' }
  | null

export function ItemCreateModal({
  formError,
  isMajorCategoryLoading = false,
  isMiddleCategoryFetched = false,
  isMiddleCategoryLoading = false,
  isSubmitting = false,
  isSkuChecking = false,
  isUnitLoading = false,
  majorCategoryOptions,
  middleCategoryOptions,
  onClose,
  onMajorCategoryChange,
  onSkuCheck,
  onSubmit,
  open,
  unitOptions,
}: ItemCreateModalProps) {
  const [skuCheckState, setSkuCheckState] = useState<SkuCheckState>(null)
  const {
    control,
    formState: { errors },
    getValues,
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
  const sku = useWatch({ control, name: 'sku' })
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

  const normalizedSku = sku.trim()
  const currentSkuCheckState = skuCheckState?.sku === normalizedSku ? skuCheckState : null

  async function handleSkuCheckClick() {
    const nextSku = normalizedSku

    if (!nextSku) {
      return
    }

    setSkuCheckState({ message: '부품 코드 중복 확인 중입니다.', sku: nextSku, status: 'checking' })

    try {
      const result = await onSkuCheck(nextSku)

      if (getValues('sku').trim() !== nextSku) {
        return
      }

      setSkuCheckState({
        message: result.message || (result.available ? '사용 가능한 부품 코드입니다.' : '이미 사용 중인 부품 코드입니다.'),
        sku: result.sku || nextSku,
        status: result.available ? 'available' : 'unavailable',
      })

      if (result.available) {
        toast.success(result.message || '사용 가능한 SKU입니다.')
      } else {
        toast.error(result.message || '이미 사용 중인 SKU입니다.')
      }
    } catch (error) {
      const message = getItemErrorDetail(error, '부품 코드 중복 확인 중 오류가 발생했습니다.')

      setSkuCheckState({
        message,
        sku: nextSku,
        status: 'error',
      })
      if (message) {
        toast.error(message)
      }
    }
  }

  const skuCheckMessage = isSkuChecking && currentSkuCheckState?.status === 'checking'
    ? '부품 코드 중복 확인 중입니다.'
    : currentSkuCheckState?.message
  const skuCheckError =
    currentSkuCheckState?.status === 'unavailable' || currentSkuCheckState?.status === 'error'
      ? skuCheckMessage
      : undefined
  const skuCheckHint = currentSkuCheckState?.status === 'available' ? skuCheckMessage : undefined
  const skuRegistration = register('sku')

  async function submit(values: ItemFormValues) {
    const submitSku = values.sku.trim()
    const hasAvailableSku =
      currentSkuCheckState?.status === 'available' && currentSkuCheckState.sku === submitSku

    if (!hasAvailableSku) {
      toast.error('SKU 중복 확인을 먼저 완료해주세요.')
      return
    }

    await onSubmit({
      ...values,
      sku: submitSku,
    })
  }

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
              loading={isSubmitting}
              disabled={isSkuChecking}
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
      <form className="grid grid-cols-2 gap-x-6 gap-y-5" id={FORM_ID} onSubmit={handleSubmit(submit)}>
        {formError ? (
          <FgNotice className="col-span-2" tone="danger">
            {formError}
          </FgNotice>
        ) : null}
        <div className="flex items-start gap-2">
          <FgInput
            error={errors.sku?.message ?? skuCheckError}
            hint={skuCheckHint}
            inputClassName="font-semibold"
            label="부품 코드"
            leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
            placeholder="HMC-XX-00000"
            required
            rootClassName="min-w-0 flex-1"
            {...skuRegistration}
          />
          <FgButton
            className="mt-7 h-11 px-3"
            disabled={!normalizedSku || isSubmitting}
            loading={isSkuChecking && currentSkuCheckState?.status === 'checking'}
            onClick={() => void handleSkuCheckClick()}
          >
            중복 확인
          </FgButton>
        </div>
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
          render={({ field }) => {
            const hasSelectedUnit = unitOptions.some((option) => option.value === field.value)

            return (
              <FgSelect
                error={errors.unit?.message}
                disabled={isUnitLoading || unitOptions.length === 0}
                label="단위"
                options={unitOptions}
                placeholder={isUnitLoading ? '단위 불러오는 중' : '단위 없음'}
                required
                value={hasSelectedUnit ? field.value : undefined}
                onValueChange={field.onChange}
              />
            )
          }}
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
