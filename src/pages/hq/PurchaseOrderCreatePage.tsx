import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { Box, Building2, Calendar, Check } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  draftLineAmount,
  emptyDraftLine,
  HQ_WAREHOUSE_OPTIONS,
  poHeaderFormSchema,
  PoLineEditor,
  SUPPLIER_FIXTURES,
} from '@/features/purchase-order'
import type { PoDraftLine, PoHeaderFormValues } from '@/features/purchase-order'
import { MOCK_SESSION } from '@/shared/config/session'
import { formatCurrency } from '@/shared/lib/format'
import { FgBadge, FgButton, FgCard, FgInput, FgNotice, FgPageHeader, FgSelect, FgTextarea } from '@/shared/ui'

const FORM_ID = 'po-header-form'
const DRAFT_PO_NO = 'PO-2026-0422'

const breadcrumbs = [{ label: '구매' }, { label: '구매 주문' }, { label: '신규 등록' }]

const supplierOptions = SUPPLIER_FIXTURES.map((supplier) => ({
  label: `${supplier.name} ${supplier.code}`,
  value: supplier.code,
}))

const warehouseOptions = HQ_WAREHOUSE_OPTIONS.map((warehouse) => ({
  label: `${warehouse.name} ${warehouse.code}`,
  value: warehouse.code,
}))

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
              <FgSelect
                error={errors.supplierCode?.message}
                label="공급사"
                leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
                options={supplierOptions}
                placeholder="공급사 선택"
                required
                value={field.value || undefined}
                onValueChange={field.onChange}
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
