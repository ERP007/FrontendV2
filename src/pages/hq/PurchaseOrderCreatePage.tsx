import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Box, Building2, Calendar, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  draftLineAmount,
  emptyDraftLine,
  poHeaderFormSchema,
  PoLineEditor,
  usePurchaseOrderVendorsQuery,
} from '@/features/purchase-order'
import type { PoDraftLine, PoHeaderFormValues } from '@/features/purchase-order'
import { MOCK_SESSION } from '@/shared/config/session'
import { cn } from '@/shared/lib/cn'
import { formatCurrency } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgBadge, FgButton, FgCard, FgInput, FgNotice, FgPageHeader, FgSelect, FgTextarea } from '@/shared/ui'

const FORM_ID = 'po-header-form'
const DRAFT_PO_NO = 'PO-2026-0422'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }, { label: '신규 등록' }]

const HQ_WAREHOUSE_OPTIONS = [{ code: 'WH-HQ-001', name: '본사 중앙창고' }] as const

const warehouseOptions = HQ_WAREHOUSE_OPTIONS.map((warehouse) => ({
  label: `${warehouse.name} ${warehouse.code}`,
  value: warehouse.code,
}))

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
        공급사 <span className="text-danger">*</span>
      </span>
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            'flex h-11 items-center gap-2.5 rounded-control border bg-surface px-3 transition-colors',
            error ? 'border-danger' : 'border-line',
          )}
        >
          <Building2 aria-hidden className="h-4 w-4 shrink-0 text-faint" />
          {value && selectedName && !open ? (
            <button
              className="min-w-0 flex-1 text-left"
              type="button"
              onClick={() => setOpen(true)}
            >
              <span className="block truncate text-body font-semibold text-ink">
                {selectedName}
                <span className="ml-1.5 text-meta font-medium text-faint">{value}</span>
              </span>
            </button>
          ) : (
            <input
              className="min-w-0 flex-1 bg-transparent text-label font-semibold text-ink outline-none ring-0 placeholder:text-faint focus:outline-none focus:ring-0"
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
  const [lineError, setLineError] = useState<string | null>(null)

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<PoHeaderFormValues>({
    defaultValues: { expectedAt: '', note: '', supplierCode: '', warehouseCode: 'WH-HQ-001' },
    resolver: zodResolver(poHeaderFormSchema),
  })

  const totalAmount = lines.reduce((sum, line) => sum + draftLineAmount(line), 0)

  function validateLines(): boolean {
    const completed = lines.filter((line) => line.sku !== null)
    if (completed.length === 0) {
      setLineError('주문 품목을 1개 이상 추가하세요.')
      return false
    }
    if (completed.some((line) => line.quantity <= 0 || line.unitPrice <= 0)) {
      setLineError('모든 품목의 수량과 단가를 1 이상으로 입력하세요.')
      return false
    }
    setLineError(null)
    return true
  }

  function handleConfirm() {
    if (!validateLines()) return
    toast.success(`${DRAFT_PO_NO} 구매 주문이 확정되었습니다.`)
    void navigate({ to: '/purchase-orders' })
  }

  function handleDraftSave() {
    toast.success('임시저장되었습니다.')
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton leftIcon={<Box aria-hidden className="h-4 w-4" />} onClick={handleDraftSave}>
              임시저장
            </FgButton>
            <FgButton
              form={FORM_ID}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              type="submit"
              variant="primary"
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
            <FgBadge variant="primary">{DRAFT_PO_NO}</FgBadge>
          </div>
          <span className="text-meta font-medium text-faint">
            담당자 · {MOCK_SESSION.name} / 구매팀
          </span>
        </div>
        <form
          className="grid grid-cols-2 gap-x-6 gap-y-5"
          id={FORM_ID}
          onSubmit={handleSubmit(handleConfirm)}
        >
          <Controller
            control={control}
            name="supplierCode"
            render={({ field }) => (
              <VendorPicker
                error={errors.supplierCode?.message}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <FgInput
            error={errors.expectedAt?.message}
            label="도착 예정일"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            {...register('expectedAt')}
          />
          <Controller
            control={control}
            name="warehouseCode"
            render={({ field }) => (
              <FgSelect
                error={errors.warehouseCode?.message}
                label="납품 창고"
                leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
                options={warehouseOptions}
                required
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FgTextarea
            label="메모"
            placeholder="배송 요청사항, 결제 조건 등"
            rows={3}
            {...register('note')}
          />
        </form>
      </FgCard>

      <PoLineEditor lines={lines} onChange={setLines} />
      {lineError ? <FgNotice tone="danger">{lineError}</FgNotice> : null}

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
          form={FORM_ID}
          leftIcon={<Check aria-hidden className="h-4 w-4" />}
          type="submit"
          variant="primary"
        >
          확정
        </FgButton>
      </div>
    </div>
  )
}
