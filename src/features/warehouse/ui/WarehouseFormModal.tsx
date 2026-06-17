import { zodResolver } from '@hookform/resolvers/zod'
import { Check, IdCard, Warehouse as WarehouseIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FgButton, FgModal, FgSegmentedControl, FgSelect, FgTextarea } from '@/shared/ui'
import { FgInput } from '@/shared/ui/FgInput'

import { getWarehouseErrorDetail } from '../model/warehouse-error-policy'
import { warehouseFormSchema } from '../model/warehouse-schema'

import type {
  BranchLocation,
  Warehouse,
  WarehouseCodeCheckResult,
  WarehouseFormValues,
} from '../model/types'

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

type CodeCheckState =
  | { code: string; message: string; status: 'available' | 'checking' | 'error' | 'unavailable' }
  | null

export interface WarehouseFormModalProps {
  branches: BranchLocation[]
  initial?: Warehouse | null
  isCodeChecking?: boolean
  onClose: () => void
  onCodeCheck?: (code: string) => Promise<WarehouseCodeCheckResult>
  onSubmit: (values: WarehouseFormValues) => void
  open: boolean
  submitting?: boolean
}

export function WarehouseFormModal({
  branches,
  initial,
  isCodeChecking = false,
  onClose,
  onCodeCheck,
  onSubmit,
  open,
  submitting = false,
}: WarehouseFormModalProps) {
  const isEdit = Boolean(initial)
  // 등록 시에만 코드 중복 확인을 강제한다(수정 시 code는 불변·비활성이라 확인 대상이 아니다).
  const requiresCodeCheck = !isEdit

  const [codeCheckState, setCodeCheckState] = useState<CodeCheckState>(null)
  const {
    control,
    formState: { errors },
    getValues,
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
  const code = watch('code')

  useEffect(() => {
    if (open) {
      reset(initial ? toFormValues(initial) : emptyValues)
      setCodeCheckState(null)
    }
  }, [initial, open, reset])

  const normalizedCode = code.trim()
  // 입력 코드와 확인 시점 코드가 일치할 때만 상태 유지 → 코드를 다시 수정하면 확인 상태가 자동 리셋된다.
  const currentCodeCheckState = codeCheckState?.code === normalizedCode ? codeCheckState : null

  async function handleCodeCheckClick() {
    const nextCode = normalizedCode

    if (!nextCode || !onCodeCheck) {
      return
    }

    setCodeCheckState({ code: nextCode, message: '창고 코드 중복 확인 중입니다.', status: 'checking' })

    try {
      const result = await onCodeCheck(nextCode)

      // 응답이 늦게 도착하는 사이 사용자가 코드를 바꿨다면 결과를 버린다(stale 방지).
      if (getValues('code').trim() !== nextCode) {
        return
      }

      setCodeCheckState({
        code: result.code || nextCode,
        message: result.available ? '사용 가능한 창고 코드입니다.' : '이미 사용 중인 창고 코드입니다.',
        status: result.available ? 'available' : 'unavailable',
      })

      if (result.available) {
        toast.success('사용 가능한 창고 코드입니다.')
      } else {
        toast.error('이미 사용 중인 창고 코드입니다.')
      }
    } catch (error) {
      const message = getWarehouseErrorDetail(error, '창고 코드 중복 확인 중 오류가 발생했습니다.')

      setCodeCheckState({ code: nextCode, message, status: 'error' })
      if (message) {
        toast.error(message)
      }
    }
  }

  const codeCheckMessage =
    isCodeChecking && currentCodeCheckState?.status === 'checking'
      ? '창고 코드 중복 확인 중입니다.'
      : currentCodeCheckState?.message
  const codeCheckError =
    currentCodeCheckState?.status === 'unavailable' || currentCodeCheckState?.status === 'error'
      ? codeCheckMessage
      : undefined
  const codeCheckHint = currentCodeCheckState?.status === 'available' ? codeCheckMessage : undefined

  function submit(values: WarehouseFormValues) {
    if (requiresCodeCheck) {
      const submitCode = values.code.trim()
      const hasAvailableCode =
        currentCodeCheckState?.status === 'available' && currentCodeCheckState.code === submitCode

      if (!hasAvailableCode) {
        toast.error('창고 코드 중복 확인을 먼저 완료해주세요.')
        return
      }
    }

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
          <FgButton disabled={submitting} onClick={onClose}>
            취소
          </FgButton>
          <FgButton
            disabled={isCodeChecking}
            form={FORM_ID}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            loading={submitting}
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
          error={errors.code?.message ?? codeCheckError}
          hint={isEdit ? '창고 코드는 변경할 수 없습니다.' : codeCheckHint}
          label="창고 코드"
          leftIcon={<IdCard aria-hidden className="h-4 w-4" />}
          placeholder="WH-XX-000"
          required
          rightIcon={
            requiresCodeCheck ? (
              <FgButton
                className="shadow-none"
                disabled={!normalizedCode || submitting}
                loading={isCodeChecking && currentCodeCheckState?.status === 'checking'}
                size="sm"
                variant="primary"
                onClick={() => void handleCodeCheckClick()}
              >
                중복 확인
              </FgButton>
            ) : undefined
          }
          rightIconClassName="h-auto text-inherit"
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
