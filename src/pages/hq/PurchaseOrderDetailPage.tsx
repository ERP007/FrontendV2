import { useParams } from '@tanstack/react-router'
import {
  Ban,
  Building2,
  Calendar,
  CircleDollarSign,
  CreditCard,
  Package,
  Printer,
  Route,
  User as UserIcon,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

import {
  PoReceiveModal,
  PoTimeline,
  poTotalAmount,
  poTotalQuantity,
} from '@/features/purchase-order'
import type { PurchaseOrder } from '@/features/purchase-order'

const PURCHASE_ORDER_FIXTURES: PurchaseOrder[] = [
  {
    confirmedBy: '김민재',
    confirmedTeam: '구매팀',
    createdAt: '2026-06-10',
    events: [
      { actorName: '박지훈', actorTeam: '구매팀장', description: '발주 확정 · 공급사 자동 발송', id: 1, occurredAt: '2026-06-10T14:32:00', type: 'APPROVED' },
      { actorName: '김민재', actorTeam: '구매팀', description: '스파크 플러그 수량 300 → 400 수정', id: 2, occurredAt: '2026-06-10T11:08:00', type: 'EDITED' },
      { actorName: '김민재', actorTeam: '구매팀', description: '신규 PO 생성 · 5개 라인 등록', id: 3, occurredAt: '2026-06-09T16:45:00', type: 'DRAFT' },
    ],
    expectedAt: '2026-06-14',
    id: 1,
    lines: [
      { amount: 1680000, itemName: '엔진오일 필터 (2.0L gasoline)', lineNo: 1, quantity: 200, sku: 'HMC-EN-00214', unit: 'EA', unitPrice: 8400 },
      { amount: 4320000, itemName: '브레이크 패드 세트 (전륜)', lineNo: 2, quantity: 120, sku: 'HMC-BR-01102', unit: 'SET', unitPrice: 36000 },
      { amount: 1740000, itemName: '에어 클리너 카트리지', lineNo: 3, quantity: 120, sku: 'HMC-EN-10331', unit: 'EA', unitPrice: 14500 },
      { amount: 2480000, itemName: '스파크 플러그 (이리듐)', lineNo: 4, quantity: 400, sku: 'HMC-SP-00673', unit: 'BOX', unitPrice: 6200 },
      { amount: 4590000, itemName: '와이퍼 블레이드 24"', lineNo: 5, quantity: 300, sku: 'HMC-AC-40229', unit: 'EA', unitPrice: 15300 },
    ],
    note: null,
    paymentTerm: '월말 결제 NET 30',
    poNo: 'PO-2026-0421',
    status: 'APPROVED',
    supplierCode: 'SUP-014',
    supplierName: '(주)동성정밀',
    updatedAt: '2026-06-10T14:32:00',
    warehouseCode: 'WH-HQ-001',
    warehouseName: '본사 중앙창고',
  },
]
import { MOCK_SESSION } from '@/shared/config/session'
import {
  formatCurrency,
  formatDateTime,
  formatDateWithDay,
  formatDday,
  formatNumber,
} from '@/shared/lib/format'
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

export function PurchaseOrderDetailPage() {
  const params = useParams({ strict: false })

  const initial =
    PURCHASE_ORDER_FIXTURES.find((order) => order.poNo === params.poNo) ?? PURCHASE_ORDER_FIXTURES[0]
  const [po, setPo] = useState<PurchaseOrder>(initial)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const canCancel = po.status === 'DRAFT' || po.status === 'APPROVED'
  const canReceive = po.status === 'SHIPPED'

  function appendEvent(type: PurchaseOrder['events'][number]['type'], description: string) {
    return {
      actorName: MOCK_SESSION.name,
      actorTeam: '물류팀',
      description,
      id: Math.max(...po.events.map((event) => event.id)) + 1,
      occurredAt: new Date().toISOString(),
      type,
    }
  }

  function handleReceive(receivedDate: string) {
    setPo((previous) => ({
      ...previous,
      events: [appendEvent('RECEIVED', `전량 입고 완료 (${receivedDate}) · ${previous.warehouseName} 재고 반영`), ...previous.events],
      status: 'RECEIVED',
      updatedAt: new Date().toISOString(),
    }))
    setReceiveOpen(false)
    toast.success('입고 처리되었습니다. 납품 창고 재고에 반영됩니다.')
  }

  function handleCancel() {
    setPo((previous) => ({
      ...previous,
      events: [appendEvent('CANCELED', '주문 취소'), ...previous.events],
      status: 'CANCELED',
      updatedAt: new Date().toISOString(),
    }))
    toast.success('구매 주문이 취소되었습니다.')
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
              disabled={!canCancel}
              leftIcon={<Ban aria-hidden className="h-4 w-4" />}
              variant="danger"
              onClick={handleCancel}
            >
              취소
            </FgButton>
            <FgButton
              disabled={!canReceive}
              leftIcon={<Package aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => setReceiveOpen(true)}
            >
              입고 처리
            </FgButton>
          </>
        }
        badge={<FgDomainStatusBadge status={po.status} />}
        breadcrumbs={[{ label: '구매' }, { label: '구매 주문' }, { label: po.poNo }]}
        title={po.poNo}
      />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <FgCard>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-section text-ink">주문 정보</h2>
              <span className="text-meta font-medium text-faint">
                최종 수정 · {formatDateTime(po.updatedAt)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-x-6 gap-y-7">
              <InfoCell
                icon={<Building2 aria-hidden className="h-3.5 w-3.5" />}
                label="공급사"
                value={
                  <span>
                    {po.supplierName}
                    <span className="ml-1.5 text-meta font-medium text-faint">{po.supplierCode}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
                label="납품 창고"
                value={
                  <span>
                    {po.warehouseName}
                    <span className="ml-1.5 text-meta font-medium text-faint">{po.warehouseCode}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="등록일"
                value={formatDateWithDay(po.createdAt)}
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="도착 예정일"
                value={
                  po.expectedAt ? (
                    <span>
                      {formatDateWithDay(po.expectedAt)}
                      <strong className="ml-1.5 text-primary-strong">{formatDday(po.expectedAt)}</strong>
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
              <InfoCell
                icon={<UserIcon aria-hidden className="h-3.5 w-3.5" />}
                label="확정자"
                value={
                  po.confirmedBy ? (
                    <span>
                      {po.confirmedBy}
                      <span className="ml-1.5 text-meta font-medium text-faint">{po.confirmedTeam}</span>
                    </span>
                  ) : (
                    <span className="text-muted">미확정</span>
                  )
                }
              />
              <InfoCell
                icon={<CreditCard aria-hidden className="h-3.5 w-3.5" />}
                label="결제 조건"
                value={po.paymentTerm}
              />
              <InfoCell
                icon={<Route aria-hidden className="h-3.5 w-3.5" />}
                label="진행 단계"
                value={<span className="text-label font-semibold text-ink-2">발주 → 출고 → 입고</span>}
              />
              <InfoCell
                icon={<CircleDollarSign aria-hidden className="h-3.5 w-3.5" />}
                label="총 금액 (VAT 별도)"
                value={
                  <span className="font-bold text-primary-strong">
                    {formatCurrency(poTotalAmount(po.lines))}
                  </span>
                }
              />
            </div>
          </FgCard>

          <FgCard>
            <div className="mb-5 flex items-center gap-2.5">
              <h2 className="text-section text-ink">주문 품목</h2>
              <FgBadge variant="outline">{po.lines.length} 라인</FgBadge>
            </div>
            <div className="flex items-center gap-3 rounded-t-control border border-line bg-background px-4 py-3 text-table text-faint">
              <span className="flex-1">부품</span>
              <span className="w-14 text-center">단위</span>
              <span className="w-24 text-right">발주 수량</span>
              <span className="w-28 text-right">단가</span>
              <span className="w-32 text-right">금액</span>
            </div>
            <div className="divide-y divide-line-soft border-x border-b border-line">
              {po.lines.map((line) => (
                <div key={line.lineNo} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label font-bold text-ink">{line.itemName}</span>
                    <span className="block text-meta font-medium text-faint">{line.sku}</span>
                  </span>
                  <span className="w-14 text-center text-label font-medium text-ink-2">{line.unit}</span>
                  <span className="w-24 text-right text-label font-bold text-ink">
                    {formatNumber(line.quantity)}
                  </span>
                  <span className="w-28 text-right text-label font-medium text-muted">
                    {formatNumber(line.unitPrice)}
                  </span>
                  <span className="w-32 text-right text-label font-bold text-ink">
                    {formatCurrency(line.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-b-control border-x border-b border-line bg-background px-4 py-3.5 text-label">
              <span className="font-medium text-muted">
                총 품목 수 <strong className="text-ink">{po.lines.length}종</strong>
                <span className="mx-2 text-line">|</span>
                발주 수량 <strong className="text-ink">{formatNumber(poTotalQuantity(po.lines))}</strong>
              </span>
              <span className="font-medium text-muted">
                총 금액{' '}
                <strong className="text-body text-primary-strong">
                  {formatCurrency(poTotalAmount(po.lines))}
                </strong>
              </span>
            </div>
          </FgCard>
        </div>

        <div className="w-96 shrink-0">
          <PoTimeline events={po.events} />
        </div>
      </div>

      <PoReceiveModal
        open={receiveOpen}
        po={po}
        onClose={() => setReceiveOpen(false)}
        onConfirm={handleReceive}
      />
    </div>
  )
}
