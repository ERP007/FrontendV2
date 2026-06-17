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
} from '@/features/sales-order'
import type { SoDraftLine, SoFormValues } from '@/features/sales-order'
import { useMeQuery } from '@/features/user'
import { useHqWarehousesQuery } from '@/features/warehouse'
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
    kept.push({ ...line, itemName: item.name, safetyStock: item.safetyStock, unit: item.unit })
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
  const { data: me } = useMeQuery()
  const submitMutation = useSubmitSalesOrderMutation(code)
  const itemsBatchMutation = useItemsBatchMutation()

  const [lines, setLines] = useState<SoDraftLine[]>([])
  const [lineError, setLineError] = useState<string | null>(null)
  const hydratedRef = useRef(false)

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<SoFormValues>({
    defaultValues: defaultSoFormValues,
    resolver: zodResolver(soDraftFormSchema),
  })

  // 최초 1회만 서버 값으로 폼/라인을 채운다. (refetch가 사용자 편집을 덮지 않도록)
  // DRAFT 라인은 itemName·unit 이 null 이라 batch 로 채우고, 비활성/없는 품목 라인은 제거한다.
  useEffect(() => {
    if (!data || hydratedRef.current) return
    hydratedRef.current = true
    reset(data.values)

    const detailLines = data.lines
    const skus = detailLines
      .map((line) => line.itemCode)
      .filter((sku): sku is string => Boolean(sku))

    const hydrateLines = skus.length
      ? itemsBatchMutation.mutateAsync(skus).then((batch) => {
          const { lines: enriched, removedSkus } = enrichDraftLines(detailLines, batch)
          if (removedSkus.length > 0) {
            toast.warning(
              `사용 불가 품목 ${removedSkus.length}건이 요청에서 제거되었습니다. (${removedSkus.join(', ')})`,
            )
          }
          return enriched
        })
      : Promise.resolve(detailLines)

    // batch 실패 시 원본 라인 유지 (전역 인터셉터가 toast 처리)
    void hydrateLines.catch(() => detailLines).then(setLines)
  }, [data, itemsBatchMutation, reset])

  const breadcrumbs = [
    { label: '발주' },
    { label: '내 지점 발주 요청' },
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

  const isSubmitting = submitMutation.isPending

  const handleSaveDraft = () => {
    toast.info('임시저장은 추후 연결 예정입니다.')
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
        desiredArrivalDate: values.desiredArrivalDate,
        lines: payloadLines,
        memo: values.memo ?? null,
        warehouseCode: values.warehouseCode,
      })
      toast.success(`${updated.code} 발주 요청이 제출되었습니다.`)
      void navigate({ params: { soNo: code }, to: '/branch/sales-orders/$soNo' })
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
              onClick={handleSaveDraft}
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

      <form className="fg-content" onSubmit={submitOrder}>
        <SoForm
          assigneeLabel={`${me?.name ?? '—'} / ${me?.tenancyName ?? '—'} · ${roleLabel(me?.role)}`}
          branchCode={me?.tenancyCode ?? '—'}
          branchName={me?.tenancyName ?? '—'}
          control={control}
          errors={errors}
          lineError={lineError}
          lines={lines}
          register={register}
          renderSearchPanel={(props) => (
            <SoItemSearchPanel {...props} warehouseCode={me?.tenancyCode} />
          )}
          warehouses={hqWarehouses}
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
            onClick={handleSaveDraft}
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
