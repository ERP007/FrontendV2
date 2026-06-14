import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgInput, FgModal } from '@/shared/ui'

import type { SafetyStockEdit } from '../model/types'

const FORM_ID = 'safety-stock-form'

const safetyStockSchema = z.object({
  safetyStock: z
    .number({ message: '안전재고를 입력하세요.' })
    .int('정수로 입력하세요.')
    .min(0, '안전재고는 0 이상으로 입력하세요.'),
})

type SafetyStockFormValues = z.infer<typeof safetyStockSchema>

export interface SafetyStockModalProps {
  /** 프리필 데이터(현재 안전재고·현재고·version). 로딩 중이면 null. */
  edit: SafetyStockEdit | null
  loading?: boolean
  onClose: () => void
  onSubmit: (safetyStock: number) => void
  open: boolean
  submitting?: boolean
}

export function SafetyStockModal({
  edit,
  loading = false,
  onClose,
  onSubmit,
  open,
  submitting = false,
}: SafetyStockModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<SafetyStockFormValues>({
    defaultValues: { safetyStock: 0 },
    resolver: zodResolver(safetyStockSchema),
  })

  useEffect(() => {
    if (open && edit) {
      reset({ safetyStock: edit.safetyStock })
    }
  }, [edit, open, reset])

  function submit(values: SafetyStockFormValues) {
    onSubmit(values.safetyStock)
  }

  return (
    <FgModal
      footer={
        <>
          <FgButton disabled={submitting} onClick={onClose}>
            취소
          </FgButton>
          <FgButton
            disabled={!edit}
            form={FORM_ID}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            loading={submitting}
            type="submit"
            variant="primary"
          >
            저장
          </FgButton>
        </>
      }
      open={open}
      size="sm"
      title="안전 재고 조정"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      {loading && !edit ? (
        <div className="p-8 text-center text-meta text-muted">현재 안전재고를 불러오는 중…</div>
      ) : edit ? (
        <form className="flex flex-col gap-5" id={FORM_ID} onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <span className="block text-label text-ink-2">부품</span>
            <div className="flex h-11 items-center gap-3 rounded-control border border-line bg-line-soft px-3.5 text-body">
              <span className="font-semibold text-muted">{edit.sku}</span>
              <span className="truncate font-semibold text-ink">{edit.itemName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-control border border-line bg-background px-4 py-3">
              <p className="text-meta text-faint">창고</p>
              <p className="mt-1 font-semibold text-ink">{edit.warehouseCode}</p>
            </div>
            <div className="rounded-control border border-line bg-background px-4 py-3">
              <p className="text-meta text-faint">현재 재고</p>
              <p className="mt-1 font-semibold text-ink">
                {formatNumber(edit.quantity)} <span className="font-medium text-faint">{edit.itemUnit}</span>
              </p>
            </div>
          </div>

          <FgInput
            error={errors.safetyStock?.message}
            hint={`현재 안전재고 ${formatNumber(edit.safetyStock)} ${edit.itemUnit}`}
            inputClassName="text-right font-bold"
            label="새 안전 재고"
            leftIcon={<ShieldCheck aria-hidden className="h-4 w-4" />}
            min={0}
            required
            rightIcon={<span className="text-meta font-semibold text-faint">{edit.itemUnit}</span>}
            type="number"
            {...register('safetyStock', { valueAsNumber: true })}
          />
        </form>
      ) : null}
    </FgModal>
  )
}
