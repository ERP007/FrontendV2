import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Ban,
  Calendar,
  Check,
  Edit3,
  PackageCheck,
  Send,
  User as UserIcon,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  SoCancelModal,
  SoHistoryTimeline,
  SoNoteBox,
  useBranchSalesOrderQuery,
  useCancelSalesOrderMutation,
  useRequestSalesOrderMutation,
} from '@/features/sales-order'
import type { SalesOrderDetail } from '@/features/sales-order'
import { useStockQuantitiesQuery } from '@/features/stock'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgButton, FgCard, FgDomainStatusBadge, FgPageHeader } from '@/shared/ui'

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

export function BranchSalesOrderDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false })
  const code = params.soNo ?? ''
  const { data: so } = useBranchSalesOrderQuery(code)
  const requestMutation = useRequestSalesOrderMutation(code)
  const cancelMutation = useCancelSalesOrderMutation(code)
  const [cancelOpen, setCancelOpen] = useState(false)

  // 수신(지점) 창고 기준 현재고·안전재고 조회 (toWarehouseCode + 라인 sku)
  const skus = so?.lines.map((line) => line.itemCode) ?? []
  const { data: stockMap } = useStockQuantitiesQuery(so?.toWarehouse.code, skus)

  if (!so) return null

  async function handleSubmitRequest() {
    try {
      const result = await requestMutation.mutateAsync()
      toast.success(`${result.code} 발주 요청이 제출되었습니다.`)
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }

  async function handleCancel(reason: string) {
    try {
      const result = await cancelMutation.mutateAsync({ reason })
      toast.success(`${result.code} 발주 요청이 취소되었습니다.`)
      setCancelOpen(false)
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }

  function renderActions(so: SalesOrderDetail) {
    if (so.status === 'DRAFT') {
      return (
        <>
          <FgButton
            leftIcon={<Edit3 aria-hidden className="h-4 w-4" />}
            onClick={() =>
              void navigate({ params: { soNo: so.code }, to: '/branch/sales-orders/$soNo/edit' })
            }
          >
            수정하기
          </FgButton>
          <FgButton
            disabled={requestMutation.isPending}
            leftIcon={<Send aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => void handleSubmitRequest()}
          >
            제출하기
          </FgButton>
        </>
      )
    }
    if (so.status === 'REQUESTED') {
      return (
        <FgButton
          disabled={cancelMutation.isPending}
          leftIcon={<Ban aria-hidden className="h-4 w-4" />}
          variant="danger"
          onClick={() => setCancelOpen(true)}
        >
          취소하기
        </FgButton>
      )
    }
    if (so.status === 'APPROVED') {
      return (
        <FgButton
          leftIcon={<PackageCheck aria-hidden className="h-4 w-4" />}
          variant="primary"
          onClick={() =>
            void navigate({
              params: { soNo: so.code },
              to: '/branch/sales-orders/$soNo/arrival',
            })
          }
        >
          입고하기
        </FgButton>
      )
    }
    return null
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={renderActions(so)}
        badge={<FgDomainStatusBadge label={so.progressLabel} status={so.progressBadgeStatus} />}
        breadcrumbs={[
          { label: '발주' },
          { label: '발주 현황' },
          { label: so.code },
        ]}
        title={so.code}
      />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <FgCard>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-section text-ink">발주 요약</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
              <InfoCell
                icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
                label="출고 창고"
                value={
                  <span className="block">
                    {so.toWarehouse.name ?? so.toWarehouse.code}
                    <span className="block text-meta font-medium text-faint">{so.toWarehouse.code}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
                label="수신 창고"
                value={
                  <span className="block">
                    {so.fromWarehouse.name ?? so.fromWarehouse.code}
                    <span className="block text-meta font-medium text-faint">{so.fromWarehouse.code}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<UserIcon aria-hidden className="h-3.5 w-3.5" />}
                label="요청자"
                value={
                  <span>
                    {so.requesterName}
                    {so.requesterPosition ? (
                      <span className="ml-1.5 text-meta font-medium text-faint">
                        {so.requesterPosition}
                      </span>
                    ) : null}
                  </span>
                }
              />
              <InfoCell
                icon={<Check aria-hidden className="h-3.5 w-3.5" />}
                label="승인자"
                value={so.approvalLabel ?? <span className="font-medium text-muted">미승인</span>}
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="요청일"
                value={so.requestedAtLabel}
              />
            </div>
          </FgCard>

          <FgCard>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-section text-ink">요청 품목</h2>
                <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
              </div>
            </div>
            <div className="overflow-hidden rounded-control border border-line">
              <table className="w-full text-label">
                <thead className="bg-background text-table text-faint">
                  <tr>
                    <th className="px-4 py-3 text-left">부품</th>
                    <th className="w-24 px-4 py-3 text-center">단위</th>
                    <th className="w-32 px-4 py-3 text-right">요청 수량</th>
                    <th className="w-32 px-4 py-3 text-right">현재고</th>
                    <th className="w-32 px-4 py-3 text-right">안전재고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {so.lines.map((line) => {
                    const stock = stockMap?.get(line.itemCode)
                    const shortage =
                      stock != null && stock.quantity < stock.safetyStock
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
                        <td className="px-4 py-3 text-right">
                          {stock ? (
                            <span className={cn('font-bold', shortage ? 'text-danger' : 'text-ink')}>
                              {formatNumber(stock.quantity)}
                            </span>
                          ) : (
                            <span className="font-medium text-faint">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-ink-2">
                          {stock ? formatNumber(stock.safetyStock) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {so.requestMemo ? <SoNoteBox note={so.requestMemo} /> : null}
          </FgCard>
        </div>

        <div className="w-96 shrink-0">
          <SoHistoryTimeline code={so.code} />
        </div>
      </div>

      {cancelOpen ? (
        <SoCancelModal
          isSubmitting={cancelMutation.isPending}
          open
          so={so}
          onClose={() => setCancelOpen(false)}
          onConfirm={(reason) => void handleCancel(reason)}
        />
      ) : null}
    </div>
  )
}
