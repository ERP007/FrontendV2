import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Building2, Calendar, FileText, ShoppingCart, Truck, Warehouse as WarehouseIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  CARRIER_TYPE_LABELS,
  SoSagaProgressModal,
  useApproveSalesOrderMutation,
  useHqSalesOrderQuery,
} from '@/features/sales-order'
import type { CarrierType } from '@/features/sales-order'
import type { PoDraftLine } from '@/features/purchase-order'
import { invalidateStockQueries, useStockQuantitiesQuery } from '@/features/stock'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import {
  FgBadge,
  FgButton,
  FgCard,
  FgDomainStatusBadge,
  FgInput,
  FgPageHeader,
  FgSelect,
} from '@/shared/ui'

const CARRIER_OPTIONS = (Object.keys(CARRIER_TYPE_LABELS) as CarrierType[]).map((value) => ({
  label: CARRIER_TYPE_LABELS[value],
  value,
}))

function InfoCell({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-meta text-faint">
        {icon}
        {label}
      </p>
      <div className="mt-2 text-body font-semibold text-ink">{value}</div>
    </div>
  )
}

export function SalesOrderShipPage() {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const code = params.soNo ?? ''

  const { data: so } = useHqSalesOrderQuery(code)
  const skus = so?.lines.map((line) => line.itemCode) ?? []
  const { data: stockMap } = useStockQuantitiesQuery(so?.toWarehouse.code, skus)
  const approveMutation = useApproveSalesOrderMutation(code)

  const [carrierType, setCarrierType] = useState<CarrierType | ''>('')
  const [approvedDate, setApprovedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [invoiceNumber, setInvoiceNumber] = useState('')
  // 승인(#6) saga 진행을 스텝퍼 모달로 표시한다(OUTBOUND_IN_PROGRESS 시).
  const [progressOpen, setProgressOpen] = useState(false)

  if (!so) return null

  const totalRequested = so.lines.reduce((sum, line) => sum + line.requestQuantity, 0)

  // 현재고가 요청 수량에 못 미치는(잔여 음수) 라인 → 구매 요청 프리필. 구매 수량은 부족분(요청−현재고).
  const shortageLines: PoDraftLine[] = so.lines
    .map((line) => ({ line, shortfall: line.requestQuantity - (stockMap?.get(line.itemCode)?.quantity ?? 0) }))
    .filter(({ shortfall }) => shortfall > 0)
    .map(({ line, shortfall }) => ({
      itemName: line.itemName ?? line.itemCode ?? '',
      quantity: shortfall,
      sku: line.itemCode,
      unit: line.unit,
      unitPrice: 0,
    }))

  function handlePurchaseRequest() {
    if (shortageLines.length === 0) return
    // 라인 배열은 URL이 아닌 history state로 넘긴다(구매 주문 등록 페이지에서 프리필).
    void navigate({ to: '/purchase-orders/new', state: { poPrefillLines: shortageLines } })
  }

  async function handleConfirm() {
    if (!carrierType) {
      toast.error('운송 수단을 선택하세요.')
      return
    }
    try {
      const result = await approveMutation.mutateAsync({
        approvedDate,
        carrierType,
        invoiceNumber: invoiceNumber.trim() ? invoiceNumber.trim() : undefined,
      })
      // 진행중이면 스텝퍼 모달, 즉시 확정이면 바로 이동.
      if (result.progress === 'OUTBOUND_IN_PROGRESS') {
        setProgressOpen(true)
      } else {
        invalidateStockQueries(queryClient)
        toast.success(`${result.code} 출고되었습니다.`)
        void navigate({ params: { soNo: code }, replace: true, to: '/sales-orders/$soNo' })
      }
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <FgButton
            disabled={shortageLines.length === 0}
            leftIcon={<ShoppingCart aria-hidden className="h-4 w-4" />}
            onClick={handlePurchaseRequest}
          >
            부족 부품 구매 요청
            {shortageLines.length > 0 ? ` (${shortageLines.length})` : ''}
          </FgButton>
        }
        badge={
          <span className="flex items-center gap-2.5">
            <span className="text-h1 font-extrabold text-muted">출고 처리</span>
            <FgDomainStatusBadge label={so.progressLabel} status={so.progressBadgeStatus} />
          </span>
        }
        breadcrumbs={[{ label: '발주' }, { label: '발주 현황' }, { label: `${so.code} 출고 처리` }]}
        title={so.code}
      />

      <FgCard>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">발주 요약</h2>
          <span className="text-meta font-medium text-faint">요청자 · {so.requesterLabel}</span>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-7">
          <InfoCell
            icon={<Building2 aria-hidden className="h-3.5 w-3.5" />}
            label="요청 지점"
            value={
              <span>
                {so.fromWarehouse.name}
                <span className="ml-1.5 text-meta font-medium text-faint">
                  {so.fromWarehouse.code}
                </span>
              </span>
            }
          />
          <InfoCell
            icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
            label="출고 창고"
            value={
              <span>
                {so.toWarehouse.name}
                <span className="ml-1.5 text-meta font-medium text-faint">{so.toWarehouse.code}</span>
              </span>
            }
          />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-meta text-faint">
              <Truck aria-hidden className="h-3.5 w-3.5" />
              운송 수단
            </p>
            <div className="mt-2">
              <FgSelect
                options={CARRIER_OPTIONS}
                placeholder="선택"
                value={carrierType || undefined}
                onValueChange={(value) => setCarrierType(value as CarrierType)}
              />
            </div>
          </div>
        </div>
      </FgCard>

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-section text-ink">출고 품목</h2>
            <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
          </div>
          <span className="text-meta font-medium text-faint">현재고 기준 · {so.toWarehouse.code}</span>
        </div>
        <div className="overflow-hidden rounded-control border border-line">
          <table className="w-full text-label">
            <thead className="bg-background text-table text-faint">
              <tr>
                <th className="px-4 py-3 text-left">부품</th>
                <th className="w-24 px-4 py-3 text-center">단위</th>
                <th className="w-32 px-4 py-3 text-right">요청 수량</th>
                <th className="w-32 px-4 py-3 text-right">현재고</th>
                <th className="w-32 px-4 py-3 text-right">잔여</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {so.lines.map((line) => {
                const quantity = stockMap?.get(line.itemCode)?.quantity ?? 0
                const remaining = quantity - line.requestQuantity
                const shortage = remaining < 0
                return (
                  <tr key={line.id}>
                    <td className="px-4 py-3">
                      <span className="block font-semibold text-ink">{line.itemName}</span>
                      <span className="block text-meta font-medium text-faint">{line.itemCode}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-ink-2">{line.unit}</td>
                    <td className="px-4 py-3 text-right font-bold text-ink">
                      {formatNumber(line.requestQuantity)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink-2">
                      {formatNumber(quantity)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn('font-bold', shortage ? 'text-danger' : 'text-ink')}>
                        {formatNumber(remaining)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-soft pt-4 text-label">
          <span className="font-medium text-muted">
            총 품목 수 <strong className="text-ink">{so.lines.length}종</strong>
            <span className="mx-2 text-line">|</span>
            요청 합계 <strong className="text-ink">{formatNumber(totalRequested)}</strong>
          </span>
        </div>
      </FgCard>

      <FgCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-section text-ink">출고 정보</h2>
          <span className="text-meta font-medium text-faint">확정 시 재고 자동 차감</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <FgInput
            label="출고 일자"
            leftIcon={<Calendar aria-hidden className="h-4 w-4" />}
            required
            type="date"
            value={approvedDate}
            onChange={(event) => setApprovedDate(event.target.value)}
          />
          <FgInput
            hint="선택"
            label="송장번호"
            leftIcon={<FileText aria-hidden className="h-4 w-4" />}
            placeholder="HMC-00000-000"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
          />
        </div>
      </FgCard>

      <FgCard className="flex items-center justify-end gap-2.5" compact>
        <FgButton variant="ghost" onClick={() => router.history.back()}>
          취소
        </FgButton>
        <FgButton
          disabled={approveMutation.isPending || progressOpen}
          leftIcon={<Truck aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={() => void handleConfirm()}
        >
          출고 확정
        </FgButton>
      </FgCard>

      {progressOpen ? (
        <SoSagaProgressModal
          code={code}
          mode="OUTBOUND"
          open
          onClose={() => setProgressOpen(false)}
          onSuccess={() => {
            invalidateStockQueries(queryClient)
            setProgressOpen(false)
            toast.success(`${code} 출고되었습니다.`)
            void navigate({ params: { soNo: code }, replace: true, to: '/sales-orders/$soNo' })
          }}
        />
      ) : null}
    </div>
  )
}
