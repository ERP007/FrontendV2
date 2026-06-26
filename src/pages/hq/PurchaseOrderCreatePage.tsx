import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter, useRouterState } from '@tanstack/react-router'
import { Box, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useItemsBatchMutation } from '@/features/item'
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
import { useHqWarehousesQuery } from '@/features/warehouse'
import { useSession } from '@/shared/auth/session'
import { roleLabel } from '@/shared/config/session'
import { FgButton, FgPageHeader } from '@/shared/ui'

import { PoItemSearchPanel } from './PoItemSearchPanel'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }, { label: '신규 등록' }]

// 발주 출고 처리 '부족 부품 구매 요청'에서 history state로 넘어오는 프리필 라인.
declare module '@tanstack/react-router' {
  interface HistoryState {
    poPrefillLines?: PoDraftLine[]
  }
}

export function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()
  // 출고 처리 화면에서 history state로 넘어온 프리필 라인(있으면 초기 라인으로 사용).
  const prefillLines = useRouterState({ select: (state) => state.location.state.poPrefillLines })
  const [lines, setLines] = useState<PoDraftLine[]>(() =>
    prefillLines && prefillLines.length > 0 ? prefillLines : [emptyDraftLine()],
  )
  const [lineError, setLineError] = useState<string | null>(null)

  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: session } = useSession()
  const draftMutation = useCreatePurchaseOrderDraftMutation()
  const createMutation = useCreatePurchaseOrderMutation()
  const itemsBatchMutation = useItemsBatchMutation()

  // 프리필 라인의 단가는 출고 화면에서 비어(0) 넘어온다. item 일괄 조회(/items/batch)로 sku별
  // 단가를 채운다. StrictMode 이중 호출을 ref로 1회만 실행하고, setLines는 비동기 콜백에서 호출한다.
  const priceFilledRef = useRef(false)
  useEffect(() => {
    if (priceFilledRef.current) return
    const skus = (prefillLines ?? [])
      .map((line) => line.sku)
      .filter((sku): sku is string => sku !== null)
    if (skus.length === 0) return
    priceFilledRef.current = true

    void itemsBatchMutation
      .mutateAsync(skus)
      .then((result) => {
        const priceBySku = new Map(result.items.map((item) => [item.sku, item.unitPrice]))
        setLines((current) =>
          current.map((line) =>
            line.sku ? { ...line, unitPrice: priceBySku.get(line.sku) ?? line.unitPrice } : line,
          ),
        )
      })
      .catch(() => {
        // 전역 인터셉터가 toast 처리. 단가는 0으로 유지된다.
      })
    // 최초 진입 시 1회만 실행한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <FgPageHeader breadcrumbs={breadcrumbs} title="구매 주문 등록" />

      <PoForm
        assigneeLabel={`${session?.name ?? '—'} / ${roleLabel(session?.userRole)}`}
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
