import { zodResolver } from '@hookform/resolvers/zod'
import { Check, IdCard, Warehouse as WarehouseIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { FgButton, FgModal, FgSegmentedControl, FgSelect, FgTextarea } from '@/shared/ui'
import { FgInput } from '@/shared/ui/FgInput'

import { warehouseFormSchema } from '../model/warehouse-schema'

import type { BranchLocation, Warehouse, WarehouseFormValues } from '../model/types'

const FORM_ID = 'warehouse-form'

const emptyValues: WarehouseFormValues = {
  address: '',
  branchId: null,
  code: '',
  name: '',
  type: 'DEALER',
}

function toFormValues(warehouse: Warehouse): WarehouseFormValues {
  return {
    address: warehouse.address,
    branchId: warehouse.branchId,
    code: warehouse.code,
    name: warehouse.name,
    type: warehouse.type,
  }
}

export interface WarehouseFormModalProps {
  branches: BranchLocation[]
  initial?: Warehouse | null
  onClose: () => void
  onSubmit: (values: WarehouseFormValues) => void
  open: boolean
}

export function WarehouseFormModal({ branches, initial, onClose, onSubmit, open }: WarehouseFormModalProps) {
  const isEdit = Boolean(initial)

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<WarehouseFormValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(warehouseFormSchema),
  })

  const type = watch('type')

  useEffect(() => {
    if (open) {
      reset(initial ? toFormValues(initial) : emptyValues)
    }
  }, [initial, open, reset])

  function submit(values: WarehouseFormValues) {
    onSubmit({
      ...values,
      branchId: values.type === 'HQ' ? null : values.branchId,
    })
  }

  const branchOptions = branches.map((branch) => ({
    label: branch.name,
    value: String(branch.id),
  }))

  return (
    <FgModal
      footer={
        <>
          <FgButton onClick={onClose}>취소</FgButton>
          <FgButton
            form={FORM_ID}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            type="submit"
            variant="primary"
          >
            {isEdit ? '저장' : '등록'}
          </FgButton>
        </>
      }
      open={open}
      size="sm"
      title={isEdit ? '창고 수정' : '창고 추가'}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <form className="flex flex-col gap-5" id={FORM_ID} onSubmit={handleSubmit(submit)}>
        <FgInput
          disabled={isEdit}
          error={errors.code?.message}
          hint={isEdit ? '창고 코드는 변경할 수 없습니다.' : undefined}
          label="창고 코드"
          leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
          placeholder="WH-XX-000"
          required
          {...register('code')}
        />
        <FgInput
          error={errors.name?.message}
          label="창고명"
          leftIcon={<WarehouseIcon aria-hidden className="h-4 w-4" />}
          placeholder="예) 서울 1창고"
          required
          {...register('name')}
        />
        <div className="space-y-2">
          <span className="block text-label text-ink-2">
            유형<span className="text-danger"> *</span>
          </span>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <FgSegmentedControl
                className="grid-cols-2"
                options={[
                  { label: 'HQ', value: 'HQ' },
                  { label: 'DEALER', value: 'DEALER' },
                ]}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  if (value === 'HQ') {
                    setValue('branchId', null, { shouldValidate: true })
                  }
                }}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="branchId"
          render={({ field }) => (
            <FgSelect
              disabled={type === 'HQ'}
              error={errors.branchId?.message}
              hint="HQ 유형은 소속 지점 없이 본사 직속으로 등록됩니다."
              label="소속 지점"
              options={branchOptions}
              placeholder="지점 선택"
              required={type === 'DEALER'}
              value={field.value === null ? undefined : String(field.value)}
              onValueChange={(value) => field.onChange(Number(value))}
            />
          )}
        />
        <FgTextarea
          error={errors.address?.message}
          label="주소"
          placeholder="도로명 · 지번 주소"
          rows={3}
          {...register('address')}
        />
      </form>
    </FgModal>
  )
}
