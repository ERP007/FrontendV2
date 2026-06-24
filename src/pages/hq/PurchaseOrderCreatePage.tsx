import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Box, Check } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  defaultPurchaseOrderFormValues,
  emptyDraftLine,
  linesToRequest,
  PoForm,
  purchaseOrderDraftFormSchema,
  useCreatePurchaseOrderDraftMutation,
  useCreatePurchaseOrderMutation,
  validateLineValues,
} from '@/features/purchase-order'
import type {
  CreatePurchaseOrderRequest,
  DraftPurchaseOrderRequest,
  PoDraftLine,
  PurchaseOrderDraftFormValues,
} from '@/features/purchase-order'
import { useMeQuery } from '@/features/user'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { FgButton, FgPageHeader } from '@/shared/ui'

import { PoItemSearchPanel } from './PoItemSearchPanel'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }, { label: '신규 등록' }]

export function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [lines, setLines] = useState<PoDraftLine[]>([emptyDraftLine()])
  const [lineError, setLineError] = useState<string | null>(null)

  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: me } = useMeQuery()
  const draftMutation = useCreatePurchaseOrderDraftMutation()
  const createMutation = useCreatePurchaseOrderMutation()

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<PurchaseOrderDraftFormValues>({
    defaultValues: defaultPurchaseOrderFormValues,
    resolver: zodResolver(purchaseOrderDraftFormSchema),
  })

  const isSubmitting = draftMutation.isPending || createMutation.isPending

  const handleDraftSave = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)
    const lineErrorMessage = validateLineValues(payloadLines)
    if (lineErrorMessage) {
      setLineError(lineErrorMessage)
      return
    }
    setLineError(null)
    const payload: DraftPurchaseOrderRequest = {
      lines: payloadLines.length > 0 ? payloadLines : undefined,
      memo: values.memo || undefined,
      vendorCode: values.vendorCode,
      warehouseCode: values.warehouseCode,
    }
    try {
      const draft = await draftMutation.mutateAsync(payload)
      toast.success(`${draft.code} 임시저장되었습니다.`)
      void navigate({ to: '/purchase-orders' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  })

  const handleConfirm = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)
    if (payloadLines.length === 0) {
      setLineError('주문 품목을 1개 이상 추가하세요.')
      return
    }
    const lineErrorMessage = validateLineValues(payloadLines)
    if (lineErrorMessage) {
      setLineError(lineErrorMessage)
      return
    }
    setLineError(null)
    const payload: CreatePurchaseOrderRequest = {
      lines: payloadLines,
      memo: values.memo || undefined,
      vendorCode: values.vendorCode,
      warehouseCode: values.warehouseCode,
    }
    try {
      const order = await createMutation.mutateAsync(payload)
      toast.success(`${order.code} 구매 주문이 제출되었습니다.`)
      void navigate({ to: '/purchase-orders' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  })

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              disabled={isSubmitting}
              leftIcon={<Box aria-hidden className="h-4 w-4" />}
              onClick={handleDraftSave}
            >
              임시저장
            </FgButton>
            <FgButton
              disabled={isSubmitting}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={handleConfirm}
            >
              제출
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="구매 주문 등록"
      />

      <PoForm
        assigneeLabel={`${me?.name ?? '—'} / ${me?.position ?? '—'}`}
        control={control}
        errors={errors}
        lineError={lineError}
        lines={lines}
        register={register}
        renderSearchPanel={(props) => <PoItemSearchPanel {...props} />}
        warehouses={hqWarehouses}
        watch={watch}
        onLinesChange={setLines}
      />

      <div className="flex items-center justify-end gap-2.5">
        <FgButton variant="ghost" onClick={() => router.history.back()}>
          취소
        </FgButton>
        <FgButton
          disabled={isSubmitting}
          leftIcon={<Box aria-hidden className="h-4 w-4" />}
          onClick={handleDraftSave}
        >
          임시저장
        </FgButton>
        <FgButton
          disabled={isSubmitting}
          leftIcon={<Check aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={handleConfirm}
        >
          제출
        </FgButton>
      </div>
    </div>
  )
}
