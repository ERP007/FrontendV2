import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Ban,
  Building2,
  Calendar,
  Check,
  User as UserIcon,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  SoHistoryTimeline,
  SoNoteBox,
  SoRejectModal,
  useHqSalesOrderQuery,
  useRejectSalesOrderMutation,
} from '@/features/sales-order'
import type { RejectReasonCategory } from '@/features/sales-order'
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

export function SalesOrderDetailPage() {
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const code = params.soNo ?? ''

  const { data: so } = useHqSalesOrderQuery(code)
  const rejectMutation = useRejectSalesOrderMutation(code)
  const [rejectOpen, setRejectOpen] = useState(false)

  if (!so) return null

  const isReviewable = so.status === 'REQUESTED'

  async function handleReject(reasonCategory: RejectReasonCategory, memo: string | null) {
    try {
      const result = await rejectMutation.mutateAsync({ memo: memo ?? undefined, reasonCategory })
      toast.success(`${result.code} 발주 요청이 거절되었습니다.`)
      setRejectOpen(false)
    } catch {
      // 전역 인터셉터가 toast 처리
    }
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              disabled={!isReviewable || rejectMutation.isPending}
              leftIcon={<Ban aria-hidden className="h-4 w-4" />}
              variant="danger"
              onClick={() => setRejectOpen(true)}
            >
              거절
            </FgButton>
            <FgButton
              disabled={!isReviewable}
              leftIcon={<Check aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => void navigate({ params: { soNo: so.code }, to: '/sales-orders/$soNo/ship' })}
            >
              출고
            </FgButton>
          </>
        }
        badge={<FgDomainStatusBadge label={so.progressLabel} status={so.progressBadgeStatus} />}
        breadcrumbs={[{ label: '발주' }, { label: '발주 요청' }, { label: so.code }]}
        title={so.code}
      />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <FgCard>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-section text-ink">요청 정보</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-7">
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
                    <span className="ml-1.5 text-meta font-medium text-faint">
                      {so.toWarehouse.code}
                    </span>
                  </span>
                }
              />
              <InfoCell
                icon={<UserIcon aria-hidden className="h-3.5 w-3.5" />}
                label="요청자"
                value={so.requesterLabel}
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
            <div className="mb-5 flex items-center gap-2.5">
              <h2 className="text-section text-ink">요청 품목</h2>
              <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
            </div>
            <div className="overflow-hidden rounded-control border border-line">
              <table className="w-full text-label">
                <thead className="bg-background text-table text-faint">
                  <tr>
                    <th className="px-4 py-3 text-left">부품</th>
                    <th className="w-24 px-4 py-3 text-center">단위</th>
                    <th className="w-32 px-4 py-3 text-right">요청 수량</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {so.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-ink">{line.itemName}</span>
                        <span className="block text-meta font-medium text-faint">{line.itemCode}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-ink-2">{line.unit}</td>
                      <td className="px-4 py-3 text-right font-bold text-ink">
                        {line.requestQuantity.toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))}
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

      {rejectOpen ? (
        <SoRejectModal
          isSubmitting={rejectMutation.isPending}
          open
          so={so}
          onClose={() => setRejectOpen(false)}
          onConfirm={(reasonCategory, memo) => void handleReject(reasonCategory, memo)}
        />
      ) : null}
    </div>
  )
}
