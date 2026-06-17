import { AlertTriangle, ClipboardCheck, ClipboardList, FileEdit, Truck } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import { cn } from '@/shared/lib/cn'

import type { SalesOrderHqKpi } from '../api/use-sales-order-hq-kpi-query'
import type { SalesOrderStatus } from '../model/so-ui-model'

import type { SoBranchKpi } from '../model/filter-sales-orders'

export interface SoHqKpiCardsProps {
  activeStatus?: SalesOrderStatus
  kpi: SalesOrderHqKpi
  onSelect?: (status: SalesOrderStatus | undefined) => void
}

export function SoHqKpiCards({ activeStatus, kpi, onSelect }: SoHqKpiCardsProps) {
  const isTotalActive = activeStatus === undefined
  const isRequestedActive = activeStatus === 'REQUESTED'
  const isApprovedActive = activeStatus === 'APPROVED'

  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        className={cn(
          onSelect && 'cursor-pointer transition-colors',
          isTotalActive && 'border-primary ring-2 ring-primary',
        )}
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label="전체 요청"
        metric={formatNumber(kpi.totalCount)}
        onClick={onSelect ? () => onSelect(undefined) : undefined}
      />
      <FgKpiCard
        className={cn(
          onSelect && 'cursor-pointer transition-colors',
          isRequestedActive && 'border-primary ring-2 ring-primary',
        )}
        icon={<ClipboardCheck aria-hidden className="h-4 w-4" />}
        label="승인 대기"
        metric={
          kpi.requestedCount > 0 ? (
            <span className="text-primary-strong">{formatNumber(kpi.requestedCount)}</span>
          ) : (
            formatNumber(kpi.requestedCount)
          )
        }
        tag={kpi.requestedCount > 0 ? <FgBadge variant="primary">검토 필요</FgBadge> : undefined}
        tone={kpi.requestedCount > 0 ? 'primary' : undefined}
        onClick={onSelect ? () => onSelect('REQUESTED') : undefined}
      />
      <FgKpiCard
        className={cn(
          onSelect && 'cursor-pointer transition-colors',
          isApprovedActive && 'border-primary ring-2 ring-primary',
        )}
        footer="승인 완료 · 배송 중"
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="배송 중"
        metric={
          kpi.approvedCount > 0 ? (
            <span className="text-primary-strong">{formatNumber(kpi.approvedCount)}</span>
          ) : (
            formatNumber(kpi.approvedCount)
          )
        }
        tone={kpi.approvedCount > 0 ? 'primary' : undefined}
        onClick={onSelect ? () => onSelect('APPROVED') : undefined}
      />
      <FgKpiCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="지연"
        metric={
          kpi.delayedCount > 0 ? (
            <span className="text-danger">{formatNumber(kpi.delayedCount)}</span>
          ) : (
            formatNumber(kpi.delayedCount)
          )
        }
        tag={kpi.delayedCount > 0 ? <FgBadge variant="danger">희망일 초과</FgBadge> : undefined}
        tone={kpi.delayedCount > 0 ? 'warning' : undefined}
      />
    </div>
  )
}

export interface SoBranchKpiCardsProps {
  activeStatus?: SalesOrderStatus
  kpi: SoBranchKpi
  onSelect?: (status: SalesOrderStatus | undefined) => void
}

export function SoBranchKpiCards({ activeStatus, kpi, onSelect }: SoBranchKpiCardsProps) {
  const cards: Array<{
    footer?: string
    icon: typeof ClipboardList
    label: string
    metric: number
    status: SalesOrderStatus | undefined
  }> = [
    { icon: ClipboardList, label: '전체 요청', metric: kpi.totalCount, status: undefined },
    { footer: '작성 중', icon: FileEdit, label: '임시저장', metric: kpi.draftCount, status: 'DRAFT' },
    {
      footer: '본사 검토 중',
      icon: ClipboardCheck,
      label: '출고 대기',
      metric: kpi.requestedCount,
      status: 'REQUESTED',
    },
    {
      footer: '출고 완료 및 미수령',
      icon: Truck,
      label: '도착 대기',
      metric: kpi.approvedCount,
      status: 'APPROVED',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon
        const isActive = card.status === activeStatus
        const isApprovedHighlight = card.status === 'APPROVED' && kpi.approvedCount > 0
        return (
          <FgKpiCard
            key={card.label}
            className={cn(
              onSelect && 'cursor-pointer transition-colors',
              isActive && 'border-primary ring-2 ring-primary',
            )}
            footer={card.footer}
            icon={<Icon aria-hidden className="h-4 w-4" />}
            label={card.label}
            metric={
              isApprovedHighlight ? (
                <span className="text-primary-strong">{formatNumber(card.metric)}</span>
              ) : (
                formatNumber(card.metric)
              )
            }
            tone={isApprovedHighlight ? 'primary' : undefined}
            onClick={onSelect ? () => onSelect(card.status) : undefined}
          />
        )
      })}
    </div>
  )
}
