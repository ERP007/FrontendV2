import { useParams } from '@tanstack/react-router'
import {
  Building2,
  Calendar,
  CircleDollarSign,
  User as UserIcon,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import {
  PoHistoryTimeline,
  usePurchaseOrderHistoriesQuery,
  usePurchaseOrderQuery,
} from '@/features/purchase-order'
import { cn } from '@/shared/lib/cn'
import { formatDateWithDay } from '@/shared/lib/format'
import { FgBadge, FgCard, FgDomainStatusBadge, FgPageHeader } from '@/shared/ui'

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
  const code = params.poNo ?? ''
  const { data: po } = usePurchaseOrderQuery(code)
  const { data: histories = [] } = usePurchaseOrderHistoriesQuery(code)

  if (!po) return null

  return (
    <div className="fg-content">
      <FgPageHeader
        badge={<FgDomainStatusBadge label={po.statusLabel} status={po.status} />}
        breadcrumbs={[{ label: '구매' }, { label: '구매 주문' }, { label: po.code }]}
        title={po.code}
      />

      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <FgCard>
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-section text-ink">주문 정보</h2>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-7">
              <InfoCell
                icon={<Building2 aria-hidden className="h-3.5 w-3.5" />}
                label="공급사"
                value={
                  <span>
                    {po.vendor.name}
                    <span className="ml-1.5 text-meta font-medium text-faint">{po.vendor.code}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<WarehouseIcon aria-hidden className="h-3.5 w-3.5" />}
                label="납품 창고"
                value={
                  <span>
                    {po.warehouse.name}
                    <span className="ml-1.5 text-meta font-medium text-faint">{po.warehouse.code}</span>
                  </span>
                }
              />
              <InfoCell
                icon={<UserIcon aria-hidden className="h-3.5 w-3.5" />}
                label="확정자"
                value={
                  po.approvedBy ? (
                    <span>
                      {po.approvedBy.name}
                      <span className="ml-1.5 text-meta font-medium text-faint">
                        {po.approvedBy.position}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted">미확정</span>
                  )
                }
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="등록일"
                value={formatDateWithDay(po.createdAt)}
              />
              <InfoCell
                icon={<Calendar aria-hidden className="h-3.5 w-3.5" />}
                label="도착 희망일"
                value={
                  <span className={cn('font-semibold', po.delayed && 'text-danger')}>
                    {formatDateWithDay(po.desiredArrivalDate)}
                    <strong
                      className={cn(
                        'ml-1.5',
                        po.delayed ? 'text-danger' : 'text-primary-strong',
                      )}
                    >
                      {po.dday}
                    </strong>
                  </span>
                }
              />
              <InfoCell
                icon={<CircleDollarSign aria-hidden className="h-3.5 w-3.5" />}
                label="총 금액 (VAT 별도)"
                value={
                  <span className="font-bold text-primary-strong">{po.totalAmount}</span>
                }
              />
            </div>
          </FgCard>

          <FgCard>
            <div className="mb-5 flex items-center gap-2.5">
              <h2 className="text-section text-ink">주문 품목</h2>
              <FgBadge variant="outline">{po.lineCount} 라인</FgBadge>
            </div>
            <div className="flex items-center gap-3 rounded-t-control border border-line bg-background px-4 py-3 text-table text-faint">
              <span className="flex-1">부품</span>
              <span className="w-14 text-center">단위</span>
              <span className="w-24 text-right">발주 수량</span>
              <span className="w-28 text-right">단가</span>
              <span className="w-40 text-right">금액</span>
            </div>
            <div className="divide-y divide-line-soft border-x border-b border-line">
              {po.lines.map((line) => (
                <div key={line.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-label font-bold text-ink">{line.name}</span>
                    <span className="block text-meta font-medium text-faint">{line.sku}</span>
                  </span>
                  <span className="w-14 text-center text-label font-medium text-ink-2">
                    {line.unit}
                  </span>
                  <span className="w-24 text-right text-label font-bold text-ink">
                    {line.quantity}
                  </span>
                  <span className="w-28 text-right text-label font-medium text-muted">
                    {line.unitPrice}
                  </span>
                  <span className="w-40 text-right text-label font-bold text-ink">
                    {line.amount}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-b-control border-x border-b border-line bg-background px-4 py-3.5 text-label">
              <span className="font-medium text-muted">
                총 품목 수 <strong className="text-ink">{po.lineCount}종</strong>
                <span className="mx-2 text-line">|</span>
                발주 수량 <strong className="text-ink">{po.totalQuantity}</strong>
              </span>
              <span className="font-medium text-muted">
                총 금액 <strong className="text-body text-primary-strong">{po.totalAmount}</strong>
              </span>
            </div>
          </FgCard>
        </div>

        <div className="w-96 shrink-0">
          <PoHistoryTimeline rows={histories} />
        </div>
      </div>
    </div>
  )
}
