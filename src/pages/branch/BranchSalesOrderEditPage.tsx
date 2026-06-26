import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import { Box, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useItemsBatchMutation } from '@/features/item'
import type { ItemBatchResponse } from '@/features/item'
import {
  defaultSoFormValues,
  linesToRequest,
  soDraftFormSchema,
  SoForm,
  useSalesOrderFormQuery,
  useSubmitSalesOrderMutation,
  useUpdateSalesOrderDraftMutation,
} from '@/features/sales-order'
import type { SoDraftLine, SoFormValues } from '@/features/sales-order'
import { stockQuantitiesQueryOptions } from '@/features/stock'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { queryClient } from '@/shared/api'
import { useSession } from '@/shared/auth/session'
import { roleLabel } from '@/shared/config/session'
import { FgButton, FgCard, FgNotice, FgPageHeader } from '@/shared/ui'

import { SoItemSearchPanel } from './SoItemSearchPanel'

interface EnrichResult {
  lines: SoDraftLine[]
  removedSkus: string[]
}

/**
 * DRAFT 라인의 null 인 itemName·unit 을 batch 응답으로 채운다.
 * 비활성(active:false)이거나 조회되지 않은 품목 라인은 제거한다.
 */
function enrichDraftLines(lines: SoDraftLine[], batch: ItemBatchResponse): EnrichResult {
  const activeItems = new Map(
    batch.items.filter((item) => item.active).map((item) => [item.sku, item]),
  )
  const kept: SoDraftLine[] = []
  const removedSkus: string[] = []

  for (const line of lines) {
    const item = line.itemCode ? activeItems.get(line.itemCode) : undefined
    if (!item) {
      removedSkus.push(line.itemCode ?? '(미지정)')
      continue
    }
    kept.push({ ...line, itemName: item.name, unit: item.unit })
  }

  return { lines: kept, removedSkus }
}

export function BranchSalesOrderEditPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const params = useParams({ strict: false })
  const code = params.soNo ?? ''

  const { data, isLoading } = useSalesOrderFormQuery(code)
  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: session } = useSession()
  const submitMutation = useSubmitSalesOrderMutation(code)
  const updateDraftMutation = useUpdateSalesOrderDraftMutation(code)
  const itemsBatchMutation = useItemsBatchMutation()

  const [lines, setLines] = useState<SoDraftLine[]>([])
  const [lineError, setLineError] = useState<string | null>(null)
  const hydratedRef = useRef(false)

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<SoFormValues>({
    defaultValues: defaultSoFormValues,
    // response 의 toWarehouse.code 등 서버 값을 폼에 지속 동기화한다.
    // (reset 1회 방식은 리렌더로 폼이 defaultValues 로 풀리는 문제가 있어 values prop 사용)
    // keepDirtyValues 로 사용자가 편집한 필드는 덮어쓰지 않는다.
    resetOptions: { keepDirtyValues: true },
    resolver: zodResolver(soDraftFormSchema),
    values: data?.values,
  })

  // response 도착 후 최초 1회만, 3가지 prefill 을 각각 독립적으로 수행한다.
  // (refetch 가 사용자 편집을 덮지 않도록 hydratedRef 로 1회 제한)
  // 기본 라인을 먼저 깔고 2)·3) 결과를 각각 functional setLines 로 머지해 호출 순서에 무관하게 동작한다.
  useEffect(() => {
    if (!data || hydratedRef.current) return
    hydratedRef.current = true

    // 1) 출고 창고: useForm 의 values prop(data.values)으로 지속 동기화하므로 여기선 라인만 채운다.
    const detailLines = data.lines
    const skus = detailLines
      .map((line) => line.itemCode)
      .filter((sku): sku is string => Boolean(sku))

    setLines(detailLines)
    if (!skus.length) return

    // 2) 부품 정보: itemCode 들을 batch 조회해 itemName·unit 채우고 비활성/없는 품목 라인 제거
    void itemsBatchMutation
      .mutateAsync(skus)
      .then((batch) => {
        setLines((prev) => {
          const { lines: enriched, removedSkus } = enrichDraftLines(prev, batch)
          if (removedSkus.length > 0) {
            toast.warning(
              `사용 불가 품목 ${removedSkus.length}건이 요청에서 제거되었습니다. (${removedSkus.join(', ')})`,
            )
          }
          return enriched
        })
      })
      .catch(() => {
        // batch 실패 시 라인 유지 (전역 인터셉터가 toast 처리)
      })

    // 3) 현재고·안전재고: 같은 itemCode 들을 fromWarehouse 재고에서 batch 조회 (부품 선택 시와 동일 소스)
    void queryClient
      .fetchQuery(stockQuantitiesQueryOptions(data.fromWarehouse.code, skus))
      .then(({ stocks }) => {
        const stockMap = new Map(stocks.map((stock) => [stock.sku, stock]))
        setLines((prev) =>
          prev.map((line) => {
            const stock = line.itemCode ? stockMap.get(line.itemCode) : undefined
            // 매칭된 재고 없으면 현재고·안전재고 0 으로 표시
            return { ...line, branchStock: stock?.quantity ?? 0, safetyStock: stock?.safetyStock ?? 0 }
          }),
        )
      })
      .catch(() => {
        // 재고 조회 실패 시 라인 유지 (전역 인터셉터가 toast 처리)
      })
  }, [data, itemsBatchMutation])

  const breadcrumbs = [
    { label: '발주' },
    { label: '발주 현황' },
    { label: code || '—' },
    { label: '수정' },
  ]

  if (isLoading || !data) {
    return (
      <div className="fg-content">
        <FgPageHeader breadcrumbs={breadcrumbs} title="발주 요청 수정" />
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
        <FgPageHeader breadcrumbs={breadcrumbs} title="발주 요청 수정" />
        <FgNotice tone="danger">임시저장(DRAFT) 상태의 발주 요청만 수정할 수 있습니다.</FgNotice>
        <div className="flex justify-end">
          <FgButton
            variant="primary"
            onClick={() =>
              void navigate({ params: { soNo: code }, to: '/branch/sales-orders/$soNo' })
            }
          >
            상세로 이동
          </FgButton>
        </div>
      </div>
    )
  }

  const isSubmitting = submitMutation.isPending || updateDraftMutation.isPending

  // 출고 창고 옵션: 전체 hq 목록 + (목록에 없으면) 현재 발주의 출고 창고를 합쳐 라벨 표시·변경 모두 지원.
  const toWh = data.toWarehouse
  const warehouseOptions =
    hqWarehouses?.some((w) => w.code === toWh.code) ?? false
      ? hqWarehouses
      : [...(hqWarehouses ?? []), { code: toWh.code, name: toWh.name ?? toWh.code }]

  const handleSaveDraft = async () => {
    const values = watch()
    try {
      const updated = await updateDraftMutation.mutateAsync({
        lines: linesToRequest(lines),
        memo: values.memo,
        warehouseCode: values.warehouseCode,
      })
      toast.success(`${updated.code} 발주 요청이 임시저장되었습니다.`)
      void navigate({ to: '/branch/sales-orders' })
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }

  const submitOrder = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)

    if (payloadLines.length === 0) {
      setLineError('요청 품목을 1개 이상 추가하세요.')
      return
    }
    if (payloadLines.some((line) => line.quantity <= 0)) {
      setLineError('모든 품목의 요청 수량을 1 이상으로 입력하세요.')
      return
    }

    setLineError(null)

    try {
      const updated = await submitMutation.mutateAsync({
        lines: payloadLines,
        memo: values.memo,
        warehouseCode: values.warehouseCode,
      })
      toast.success(`${updated.code} 발주 요청이 제출되었습니다.`)
      void navigate({ params: { soNo: code }, replace: true, to: '/branch/sales-orders/$soNo' })
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
              onClick={() => void handleSaveDraft()}
            >
              저장
            </FgButton>
            <FgButton
              disabled={isSubmitting}
              leftIcon={<Send aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={submitOrder}
            >
              제출
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="발주 요청 수정"
      />

      <form noValidate className="fg-content" onSubmit={submitOrder}>
        <SoForm
          assigneeLabel={`${session?.name ?? '—'} / ${session?.tenancyName ?? '—'} · ${roleLabel(session?.userRole)}`}
          branchCode={session?.tenancyCode ?? '—'}
          branchName={session?.tenancyName ?? '—'}
          control={control}
          errors={errors}
          lineError={lineError}
          lines={lines}
          register={register}
          renderSearchPanel={(props) => (
            <SoItemSearchPanel {...props} warehouseCode={session?.tenancyCode ?? undefined} />
          )}
          warehouses={warehouseOptions}
          watch={watch}
          onLinesChange={setLines}
        />

        <div className="flex items-center justify-end gap-2.5">
          <FgButton type="button" variant="ghost" onClick={() => router.history.back()}>
            취소
          </FgButton>
          <FgButton
            disabled={isSubmitting}
            leftIcon={<Box aria-hidden className="h-4 w-4" />}
            type="button"
            onClick={() => void handleSaveDraft()}
          >
            저장
          </FgButton>
          <FgButton
            disabled={isSubmitting}
            leftIcon={<Send aria-hidden className="h-4 w-4" />}
            type="submit"
            variant="primary"
          >
            제출
          </FgButton>
        </div>
      </form>
    </div>
  )
}
