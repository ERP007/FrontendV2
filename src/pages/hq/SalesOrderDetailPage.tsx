import { useNavigate, useParams } from '@tanstack/react-router'
import {
  Ban,
  Building2,
  Calendar,
  Check,
  Lock,
  Printer,
  User as UserIcon,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  SALES_ORDER_FIXTURES,
  SoApproveModal,
  SoNoteBox,
  SoRejectModal,
  SoReviewLines,
  soShortageCount,
  soShortageTotal,
  SoTimeline,
  soTotalApproved,
  soTotalRequested,
} from '@/features/sales-order'
import type { SalesOrder } from '@/features/sales-order'
import { MOCK_SESSION } from '@/shared/config/session'
import { formatDateTime, formatDday } from '@/shared/lib/format'
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

function initialApprovedMap(so: SalesOrder): Record<number, number> {
  return Object.fromEntries(
    so.lines.map((line) => [
      line.lineNo,
      line.approvedQuantity ?? Math.min(line.requestedQuantity, line.availableStock),
    ]),
  )
}

export function SalesOrderDetailPage() {
  const params = useParams({ strict: false })
  const navigate = useNavigate()

  const initial =
    SALES_ORDER_FIXTURES.find((order) => order.reqNo === params.soNo) ?? SALES_ORDER_FIXTURES[0]
  const [so, setSo] = useState<SalesOrder>(initial)
  const [approvedMap, setApprovedMap] = useState<Record<number, number>>(() =>
    initialApprovedMap(initial),
  )
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const isReviewable = so.status === 'REQUESTED'
  const reviewedLines = so.lines.map((line) => ({
    ...line,
    approvedQuantity: approvedMap[line.lineNo] ?? line.requestedQuantity,
  }))
  const shortageTotal = soShortageTotal(so.lines)
  const shortageCount = soShortageCount(so.lines)

  function appendEvent(type: SalesOrder['events'][number]['type'], description: string) {
    return {
      actorName: MOCK_SESSION.name,
      actorOrg: '본사 물류팀',
      description,
      id: Math.max(...so.events.map((event) => event.id)) + 1,
      occurredAt: new Date().toISOString(),
      type,
    }
  }

  function handleApprove(shipWarehouseCode: string) {
    setSo((previous) => ({
      ...previous,
      approvedAt: new Date().toISOString(),
      approverName: MOCK_SESSION.name,
      events: [appendEvent('APPROVED', '승인 · 출고 창고 본사 중앙창고 지정'), ...previous.events],
      lines: previous.lines.map((line) => ({
        ...line,
        approvedQuantity: approvedMap[line.lineNo] ?? line.requestedQuantity,
      })),
      shipWarehouseCode,
      shipWarehouseName: '본사 중앙창고',
      status: 'APPROVED',
    }))
    setApproveOpen(false)
    toast.success('발주 요청이 승인되었습니다. 출고 대기로 전환됩니다.')
  }

  function handleReject(reason: string, note: string) {
    setSo((previous) => ({
      ...previous,
      events: [
        appendEvent('REJECTED', `거절 · 사유: ${reason}${note ? ` — ${note}` : ''}`),
        ...previous.events,
      ],
      rejectReason: reason,
      status: 'REJECTED',
    }))
    setRejectOpen(false)
    toast.success('발주 요청이 거절되었습니다. 요청자에게 알림이 전송됩니다.')
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              leftIcon={<Printer aria-hidden className="h-4 w-4" />}
              onClick={() => toast.info('인쇄는 백엔드 연동 후 제공됩니다.')}
            >
              인쇄
            </FgButton>
            <FgButton
              disabled={!isReviewable}
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
              onClick={() => setApproveOpen(true)}
            >
              승인
            </FgButton>
          </>
        }
        badge={<FgDomainStatusBadge status={so.status} />}
        breadcrumbs={[{ label: '발주' }, { label: '발주 요청' }, { label: so.reqNo }]}
        title={so.reqNo}
      />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <FgCard>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-section text-ink">요청 정보</h2>
              <span className="text-meta font-medium text-faint">
                최종 수정 · {formatDateTime(so.events[0]?.occurredAt ?? so.requestedAt)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-x-6 gap-y-7">
              <InfoCell
                icon={<Building2 aria-hidden className="h-3.5 w-3.5" />}
                label="요청 지점"
                value={
                  <span>
                    {so.branchName}
                    <span className="ml-1.5 text-meta font-medium text-faint">
                      {so.branchCode} · {so.branchRegion}
                    </span>
                  </span>
                }
              />
              <InfoCell
                icon={<UserIcon aria-hidden className="h-3.5 w-3.5" />}
                label="요청자"
                value={
                  <span>
                    {so.requesterName}
                    <span className="ml-1.5 text-meta font-medium text-faint">{so.requesterRole}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="요청일"
                value={formatDateTime(so.requestedAt)}
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="도착 희망일"
                value={
                  <span>
                    {so.desiredAt}
                    <strong className="ml-1.5 text-primary-strong">{formatDday(so.desiredAt)}</strong>
                  </span>
                }
              />
              <InfoCell
                icon={<Check aria-hidden className="h-3.5 w-3.5" />}
                label="승인자"
                value={
                  so.approverName ? (
                    so.approverName
                  ) : (
                    <span className="font-medium text-muted">미승인</span>
                  )
                }
              />
              <InfoCell
                icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
                label="출고 창고 (승인 후)"
                value={
                  so.shipWarehouseName ? (
                    so.shipWarehouseName
                  ) : (
                    <span className="font-medium text-muted">승인 후 선택</span>
                  )
                }
              />
            </div>
          </FgCard>

          <FgCard>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <h2 className="text-section text-ink">요청 품목</h2>
                <FgBadge variant="outline">{so.lines.length} 라인</FgBadge>
                {shortageCount > 0 ? (
                  <FgBadge variant="warning">{shortageCount}건 재고 부족</FgBadge>
                ) : null}
              </div>
              <span className="text-meta font-medium text-faint">본사 중앙창고 기준 · WH-HQ-001</span>
            </div>
            <SoReviewLines
              approvedMap={approvedMap}
              lines={so.lines}
              readOnly={!isReviewable}
              onChangeApproved={(lineNo, quantity) =>
                setApprovedMap((previous) => ({ ...previous, [lineNo]: quantity }))
              }
            />
            {so.note ? <SoNoteBox note={so.note} /> : null}
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-line-soft pt-4 text-label">
              <span className="font-medium text-muted">
                총 품목 수 <strong className="text-ink">{so.lines.length}종</strong>
                <span className="mx-2 text-line">|</span>
                요청 합계 <strong className="text-ink">{soTotalRequested(so.lines)}</strong>
                <span className="mx-2 text-line">|</span>
                승인 합계 <strong className="text-ink">{soTotalApproved(reviewedLines)}</strong>
                <span className="mx-2 text-line">|</span>
                부족{' '}
                <strong className={shortageTotal < 0 ? 'text-danger' : 'text-ink'}>{shortageTotal}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-meta font-medium text-faint">
                <Lock aria-hidden className="h-3.5 w-3.5" />
                승인 권한 · ADMIN · HQ_MANAGER
              </span>
            </div>
          </FgCard>
        </div>

        <div className="w-96 shrink-0">
          <SoTimeline events={so.events} />
        </div>
      </div>

      <SoApproveModal
        approvedMap={approvedMap}
        open={approveOpen}
        so={so}
        onClose={() => setApproveOpen(false)}
        onConfirm={handleApprove}
      />
      <SoRejectModal
        open={rejectOpen}
        so={so}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />

      {so.status === 'APPROVED' ? (
        <div className="flex justify-end">
          <FgButton
            variant="soft"
            onClick={() => void navigate({ params: { soNo: so.reqNo }, to: '/sales-orders/$soNo/ship' })}
          >
            출고 처리로 이동 →
          </FgButton>
        </div>
      ) : null}
    </div>
  )
}
