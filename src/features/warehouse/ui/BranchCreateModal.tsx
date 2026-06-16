import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Check } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FgButton, FgInput, FgModal, FgNotice } from '@/shared/ui'

import { branchFormSchema } from '../model/warehouse-schema'

import type { BranchFormSchema } from '../model/warehouse-schema'

const FORM_ID = 'branch-form'

const emptyValues: BranchFormSchema = { name: '' }

export interface BranchCreateModalProps {
  onClose: () => void
  onSubmit: (name: string) => void
  open: boolean
  submitting?: boolean
}

export function BranchCreateModal({ onClose, onSubmit, open, submitting = false }: BranchCreateModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<BranchFormSchema>({
    defaultValues: emptyValues,
    resolver: zodResolver(branchFormSchema),
  })

  // 열 때마다 빈 폼으로 초기화한다(등록 성공 후 재오픈 시 이전 값이 남지 않게).
  useEffect(() => {
    if (open) {
      reset(emptyValues)
    }
  }, [open, reset])

  function submit(values: BranchFormSchema) {
    // zod에서 trim까지 정규화된 값이므로 그대로 전달한다.
    onSubmit(values.name)
  }

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
      title="지점 추가"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <form className="flex flex-col gap-5" id={FORM_ID} onSubmit={handleSubmit(submit)}>
        <FgNotice tone="locked">ADMIN·HQ_MANAGER만 지점을 추가할 수 있습니다.</FgNotice>
        <FgInput
          error={errors.name?.message}
          hint="예) 서울 강남지점"
          label="지점명"
          leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
          placeholder="지점명을 입력하세요"
          required
          {...register('name')}
        />
      </form>
    </FgModal>
  )
}
