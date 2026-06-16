import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Box, Building2, Calendar, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useItemsInfiniteQuery } from '@/features/item'
import {
  draftLineAmount,
  emptyDraftLine,
  PoLineEditor,
  purchaseOrderDraftFormSchema,
  useCreatePurchaseOrderDraftMutation,
  useCreatePurchaseOrderMutation,
  VendorPicker,
} from '@/features/purchase-order'
import type {
  CreatePurchaseOrderRequest,
  DraftPurchaseOrderRequest,
  PoDraftLine,
  PurchaseOrderDraftFormValues,
  PurchaseOrderLineRequest,
} from '@/features/purchase-order'
import { useMeQuery } from '@/features/user'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { formatCurrency, formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import {
  FgButton,
  FgCard,
  FgInput,
  FgNotice,
  FgPageHeader,
  FgSelect,
  FgTextarea,
} from '@/shared/ui'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }, { label: '신규 등록' }]

const DATE_INPUT_CLASSNAME =
  'appearance-none bg-transparent shadow-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit]:outline-none [&::-webkit-datetime-edit]:border-0 [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none focus:!outline-none focus:!shadow-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0'

const defaultFormValues: PurchaseOrderDraftFormValues = {
  desiredArrivalDate: '',
  memo: '',
  vendorCode: '',
  warehouseCode: '',
}

function linesToRequest(lines: PoDraftLine[]): PurchaseOrderLineRequest[] {
  return lines
    .filter((line): line is PoDraftLine & { sku: string } => line.sku !== null)
    .map((line) => ({
      itemSku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    }))
}

function validateLineValues(lines: PurchaseOrderLineRequest[]): string | null {
  if (lines.some((line) => line.quantity < 1)) {
    return '모든 품목의 수량을 1 이상으로 입력하세요.'
  }
  if (lines.some((line) => line.unitPrice < 0)) {
    return '모든 품목의 단가를 0 이상으로 입력하세요.'
  }
  return null
}

interface ItemSearchPanelProps {
  onSelect: (patch: Partial<PoDraftLine>) => void
  query: string
}

function ItemSearchPanel({ onSelect, query }: ItemSearchPanelProps) {
  const debouncedQuery = useDebouncedValue(query, 300)
  const search = debouncedQuery.trim()

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useItemsInfiniteQuery({ search: search || undefined })

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '40px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const items = data?.pages.flatMap((page) => page.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0
  const isInitialLoading = isFetching && !data

  return (
    <div className="max-h-72 overflow-y-auto">
      <p className="border-b border-line-soft px-3.5 py-2 text-meta font-semibold text-faint">
        검색 결과 {formatNumber(totalElements)}건
      </p>
      {items.map((item) => (
        <button
          key={item.sku}
          className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-primary-soft"
          type="button"
          onMouseDown={(event) => {
            event.preventDefault()
            onSelect({
              itemName: item.name,
              sku: item.sku,
              unit: item.unit,
              unitPrice: item.unitPrice,
            })
          }}
        >
          <span className="min-w-0">
            <span className="block truncate text-label font-semibold text-ink">{item.name}</span>
            <span className="block text-meta font-medium text-faint">{item.sku}</span>
          </span>
          <span className="shrink-0 text-meta font-semibold text-muted">
            {formatNumber(item.unitPrice)} 원
          </span>
        </button>
      ))}
      {isInitialLoading ? (
        <p className="px-3.5 py-3 text-meta text-faint">불러오는 중…</p>
      ) : items.length === 0 ? (
        <p className="px-3.5 py-3 text-meta text-faint">일치하는 부품이 없습니다</p>
      ) : null}
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage ? (
        <p className="px-3.5 py-2 text-meta text-faint">더 불러오는 중…</p>
      ) : null}
    </div>
  )
}

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
    defaultValues: defaultFormValues,
    resolver: zodResolver(purchaseOrderDraftFormSchema),
  })

  const totalAmount = lines.reduce((sum, line) => sum + draftLineAmount(line), 0)
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
      desiredArrivalDate: values.desiredArrivalDate,
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
      desiredArrivalDate: values.desiredArrivalDate,
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

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">주문 정보</h2>
          <span className="text-meta font-medium text-faint">
            담당자 · {me?.name ?? '—'} / {me?.position ?? '—'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Controller
            control={control}
            name="vendorCode"
            render={({ field }) => (
              <VendorPicker
                error={errors.vendorCode?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FgInput
            error={errors.desiredArrivalDate?.message}
            inputClassName={DATE_INPUT_CLASSNAME}
            label="도착 예정일"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            {...register('desiredArrivalDate')}
            onClick={(event) => {
              const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void }
              input.showPicker?.()
            }}
          />
          <Controller
            control={control}
            name="warehouseCode"
            render={({ field }) => (
              <FgSelect
                className="[&_[data-placeholder]]:text-faint"
                error={errors.warehouseCode?.message}
                label="납품 창고"
                leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
                options={
                  hqWarehouses?.map((warehouse) => ({
                    label: warehouse.name,
                    supportingText: warehouse.code,
                    value: warehouse.code,
                  })) ?? []
                }
                placeholder="납품 창고 선택"
                required
                value={field.value || undefined}
                onValueChange={field.onChange}
              />
            )}
          />
          <FgTextarea
            error={errors.memo?.message}
            label="메모"
            labelTrailing={`${(watch('memo') ?? '').length} / 500`}
            maxLength={500}
            placeholder="배송 요청사항, 결제 조건 등"
            rows={3}
            {...register('memo')}
          />
        </div>
      </FgCard>

      <PoLineEditor
        lines={lines}
        renderSearchPanel={(props) => <ItemSearchPanel {...props} />}
        onChange={setLines}
      />
      {lineError ? <FgNotice tone="danger">{lineError}</FgNotice> : null}

      <FgCard className="flex items-center justify-end gap-4" compact>
        <span className="text-label font-medium text-muted">총 금액 (VAT 별도)</span>
        <span className="text-h1 text-primary-strong">{formatCurrency(totalAmount)}</span>
      </FgCard>

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
