import { zodResolver } from '@hookform/resolvers/zod'
import { Check, IdCard, Info, Package } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FgButton, FgCheckbox, FgInput, FgModal, FgSelect, FgTextarea } from '@/shared/ui'

import { itemFormSchema } from '../model/item-schema'
import { ITEM_CATEGORIES, ITEM_UNIT_OPTIONS } from '../model/types'

import type { ItemFormValues } from '../model/types'

const FORM_ID = 'item-create-form'

const majorOptions = Object.keys(ITEM_CATEGORIES).map((major) => ({ label: major, value: major }))
const unitOptions = ITEM_UNIT_OPTIONS.map((unit) => ({ label: unit, value: unit }))

export interface ItemCreateModalProps {
  /** 자동 생성 모드에서 채워줄 다음 부품 코드 */
  nextCode: string
  onClose: () => void
  onSubmit: (values: ItemFormValues) => void
  open: boolean
}

export function ItemCreateModal({ nextCode, onClose, onSubmit, open }: ItemCreateModalProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<ItemFormValues>({
    defaultValues: {
      autoGenerateCode: true,
      code: nextCode,
      defaultSafetyStock: 0,
      description: '',
      majorCategory: '',
      middleCategory: '',
      name: '',
      unit: 'EA',
    },
    resolver: zodResolver(itemFormSchema),
  })

  useEffect(() => {
    if (open) {
      reset({
        autoGenerateCode: true,
        code: nextCode,
        defaultSafetyStock: 0,
        description: '',
        majorCategory: '',
        middleCategory: '',
        name: '',
        unit: 'EA',
      })
    }
  }, [nextCode, open, reset])

  const autoGenerateCode = watch('autoGenerateCode')
  const majorCategory = watch('majorCategory')
  const unit = watch('unit')

  const middleOptions = (ITEM_CATEGORIES[majorCategory] ?? []).map((middle) => ({
    label: middle,
    value: middle,
  }))

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
        <div className="space-y-3">
          <FgInput
            disabled={autoGenerateCode}
            error={errors.code?.message}
            label="부품 코드"
            leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
            placeholder="HMC-XX-00000"
            required
            {...register('code')}
          />
          <Controller
            control={control}
            name="autoGenerateCode"
            render={({ field }) => (
              <FgCheckbox
                checked={field.value}
                label="자동 생성"
                onCheckedChange={(checked) => {
                  const next = checked === true
                  field.onChange(next)
                  if (next) setValue('code', nextCode, { shouldValidate: true })
                }}
              />
            )}
          />
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
              label="분류 — 대분류"
              options={majorOptions}
              placeholder="대분류 선택"
              required
              value={field.value || undefined}
              onValueChange={(value) => {
                field.onChange(value)
                setValue('middleCategory', '', { shouldValidate: false })
              }}
            />
          )}
        />
        <FgInput
          error={errors.defaultSafetyStock?.message}
          inputClassName="text-right font-bold"
          label="안전재고 기본"
          min={0}
          required
          rightIcon={<span className="text-meta font-semibold text-faint">{unit}</span>}
          type="number"
          {...register('defaultSafetyStock', { valueAsNumber: true })}
        />
        <Controller
          control={control}
          name="middleCategory"
          render={({ field }) => (
            <FgSelect
              disabled={!majorCategory}
              error={errors.middleCategory?.message}
              hint={!majorCategory ? '대분류 선택 후 활성화됩니다.' : undefined}
              label="분류 — 중분류"
              options={middleOptions}
              placeholder="중분류 선택"
              required
              value={field.value || undefined}
              onValueChange={field.onChange}
            />
          )}
        />
        <div className="row-span-2">
          <FgTextarea
            error={errors.description?.message}
            label="설명 · 메모"
            placeholder="부품 사양 · 호환 차종 · 비고 등"
            rows={6}
            {...register('description')}
          />
        </div>
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
      </form>
    </FgModal>
  )
}
