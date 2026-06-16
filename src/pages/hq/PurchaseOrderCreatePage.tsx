import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Box, Building2, Calendar, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  draftLineAmount,
  emptyDraftLine,
  PoLineEditor,
  purchaseOrderDraftFormSchema,
  useCreatePurchaseOrderDraftMutation,
  usePurchaseOrderVendorsQuery,
} from '@/features/purchase-order'
import type {
  DraftPurchaseOrderRequest,
  PoDraftLine,
  PurchaseOrderDraftFormValues,
  PurchaseOrderLineRequest,
} from '@/features/purchase-order'
import { useMeQuery } from '@/features/user'
import { useHqWarehousesQuery } from '@/features/warehouse'
import { cn } from '@/shared/lib/cn'
import { formatCurrency } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgButton, FgCard, FgInput, FgPageHeader, FgSelect, FgTextarea } from '@/shared/ui'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }, { label: '신규 등록' }]

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

interface VendorPickerProps {
  error?: string
  onChange: (code: string) => void
  value: string
}

function VendorPicker({ error, onChange, value }: VendorPickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const debouncedQuery = useDebouncedValue(query, 300)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const { data: vendors, isFetching } = usePurchaseOrderVendorsQuery(debouncedQuery.trim())
  const results = vendors ?? []

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div className="space-y-2">
      <span className="block text-label text-ink-2">
        공급사<span className="text-danger"> *</span>
      </span>
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            'flex h-11 items-center gap-3 rounded-control border bg-surface px-3.5 text-body transition-colors',
            error ? 'border-danger' : 'border-line',
          )}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-faint">
            <Building2 aria-hidden className="h-4 w-4" />
          </span>
          {value && selectedName && !open ? (
            <button
              className="min-w-0 flex-1 text-left"
              type="button"
              onClick={() => {
                setQuery(selectedName)
                setOpen(true)
              }}
            >
              <span className="block truncate text-body font-semibold text-ink">
                {selectedName}
                <span className="ml-1.5 text-meta font-medium text-faint">{value}</span>
              </span>
            </button>
          ) : (
            <input
              className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none ring-0 placeholder:text-faint focus:outline-none focus:ring-0"
              placeholder="공급사명 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setOpen(true)}
            />
          )}
        </div>
        {open ? (
          <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-control border border-line bg-surface shadow-popover">
            <p className="border-b border-line-soft px-3.5 py-2 text-meta font-semibold text-faint">
              {isFetching ? '검색 중…' : `검색 결과 ${results.length}건`}
            </p>
            <div className="max-h-72 overflow-y-auto">
              {results.map((vendor) => (
                <button
                  key={vendor.code}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-primary-soft"
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    onChange(vendor.code)
                    setSelectedName(vendor.name)
                    setQuery('')
                    setOpen(false)
                  }}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-label font-semibold text-ink">
                      {vendor.name}
                    </span>
                    <span className="block text-meta font-medium text-faint">{vendor.code}</span>
                  </span>
                  {!vendor.active ? (
                    <span className="shrink-0 text-meta font-semibold text-faint">비활성</span>
                  ) : null}
                </button>
              ))}
              {!isFetching && results.length === 0 ? (
                <p className="px-3.5 py-3 text-meta text-faint">일치하는 공급사가 없습니다</p>
              ) : null}
            </div>
            <button
              className="w-full border-t border-line-soft px-3.5 py-2 text-left text-meta font-semibold text-muted hover:text-ink-2"
              type="button"
              onMouseDown={(event) => {
                event.preventDefault()
                setOpen(false)
              }}
            >
              닫기
            </button>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-meta font-medium text-danger">{error}</p> : null}
    </div>
  )
}

export function PurchaseOrderCreatePage() {
  const navigate = useNavigate()
  const router = useRouter()
  const [lines, setLines] = useState<PoDraftLine[]>([emptyDraftLine()])
  const { data: hqWarehouses } = useHqWarehousesQuery()
  const { data: me } = useMeQuery()
  const draftMutation = useCreatePurchaseOrderDraftMutation()

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
  const isSubmitting = draftMutation.isPending

  function handleConfirm() {
    // TODO: 구매 주문 확정 로직 연결
  }

  const handleDraftSave = handleSubmit(async (values) => {
    const payloadLines = linesToRequest(lines)
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
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={handleConfirm}
            >
              확정
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="구매 주문 등록"
      />

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-section text-ink">주문 정보</h2>
          </div>
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
            inputClassName="appearance-none bg-transparent shadow-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:p-0 [&::-webkit-datetime-edit]:outline-none [&::-webkit-datetime-edit]:border-0 [&::-webkit-datetime-edit-fields-wrapper]:p-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:appearance-none focus:!outline-none focus:!shadow-none focus:!ring-0 focus:!ring-offset-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0"
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

      <PoLineEditor lines={lines} onChange={setLines} />

      <FgCard className="flex items-center justify-end gap-4" compact>
        <span className="text-label font-medium text-muted">총 금액 (VAT 별도)</span>
        <span className="text-h1 text-primary-strong">{formatCurrency(totalAmount)}</span>
      </FgCard>

      <div className="flex items-center justify-end gap-2.5">
        <FgButton variant="ghost" onClick={() => router.history.back()}>
          취소
        </FgButton>
        <FgButton leftIcon={<Box aria-hidden className="h-4 w-4" />} onClick={handleDraftSave}>
          임시저장
        </FgButton>
        <FgButton
          leftIcon={<Check aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={handleConfirm}
        >
          확정
        </FgButton>
      </div>
    </div>
  )
}
