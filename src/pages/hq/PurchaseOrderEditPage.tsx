import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  defaultPurchaseOrderFormValues,
  linesToRequest,
  PoForm,
  purchaseOrderDraftFormSchema,
  usePurchaseOrderFormQuery,
  useUpdatePurchaseOrderMutation,
  validateLineValues,
} from '@/features/purchase-order'
import type {
  DraftPurchaseOrderRequest,
  PoDraftLine,
  PurchaseOrderDraftFormValues,
} from '@/features/purchase-order'
import { useMeQuery } from '@/features/user'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { FgButton, FgCard, FgNotice, FgPageHeader } from '@/shared/ui'

import { PoItemSearchPanel } from './PoItemSearchPanel'

export function PurchaseOrderEditPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const params = useParams({ strict: false })
  const code = params.poNo ?? ''

  const { data, isLoading } = usePurchaseOrderFormQuery(code)
  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: me } = useMeQuery()
  const updateMutation = useUpdatePurchaseOrderMutation()

  const [lines, setLines] = useState<PoDraftLine[]>([])
  const [lineError, setLineError] = useState<string | null>(null)
  const hydratedRef = useRef(false)

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<PurchaseOrderDraftFormValues>({
    defaultValues: defaultPurchaseOrderFormValues,
    resolver: zodResolver(purchaseOrderDraftFormSchema),
  })

  // 최초 1회만 서버 값으로 폼/라인을 채운다. (refetch가 사용자 편집을 덮지 않도록)
  useEffect(() => {
    if (data && !hydratedRef.current) {
      reset(data.values)
      setLines(data.lines)
      hydratedRef.current = true
    }
  }, [data, reset])

  const breadcrumbs = [
    { label: '구매' },
    { label: '구매 주문' },
    { label: code || '—' },
    { label: '수정' },
  ]

  if (isLoading || !data) {
    return (
      <div className="fg-content">
        <FgPageHeader breadcrumbs={breadcrumbs} title="구매 주문 수정" />
        <FgCard compact>
          <p className="text-meta text-faint">불러오는 중…</p>
        </FgCard>
      </div>
    )
  }

  // DRAFT 상태에서만 수정 가능. (실제 차단은 백엔드가 수행)
  if (data.status !== 'DRAFT') {
    return (
      <div className="fg-content">
        <FgPageHeader breadcrumbs={breadcrumbs} title="구매 주문 수정" />
        <FgNotice tone="danger">
          임시저장(DRAFT) 상태의 구매 주문만 수정할 수 있습니다.
        </FgNotice>
        <div className="flex justify-end">
          <FgButton
            variant="primary"
            onClick={() =>
              void navigate({ params: { poNo: code }, to: '/purchase-orders/$poNo' })
            }
          >
            상세로 이동
          </FgButton>
        </div>
      </div>
    )
  }

  const isSubmitting = updateMutation.isPending

  const handleSave = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)
    const lineErrorMessage = validateLineValues(payloadLines)
    if (lineErrorMessage) {
      setLineError(lineErrorMessage)
      return
    }
    setLineError(null)
    const payload: DraftPurchaseOrderRequest = {
      desiredArrivalDate: values.desiredArrivalDate,
      lines: payloadLines.length > 0 ? payloadLines : undefined,
      memo: values.memo || undefined,
      vendorCode: values.vendorCode,
      warehouseCode: values.warehouseCode,
    }
    try {
      const updated = await updateMutation.mutateAsync({ code, payload })
      toast.success(`${updated.code} 구매 주문이 수정되었습니다.`)
      void navigate({ params: { poNo: code }, to: '/purchase-orders/$poNo' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  })

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <FgButton
            disabled={isSubmitting}
            leftIcon={<Check aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={handleSave}
          >
            저장
          </FgButton>
        }
        breadcrumbs={breadcrumbs}
        title="구매 주문 수정"
      />

      <PoForm
        assigneeLabel={`${me?.name ?? '—'} / ${me?.position ?? '—'}`}
        control={control}
        errors={errors}
        initialVendorName={data.vendor.name}
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
          leftIcon={<Check aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={handleSave}
        >
          저장
        </FgButton>
      </div>
    </div>
  )
}
