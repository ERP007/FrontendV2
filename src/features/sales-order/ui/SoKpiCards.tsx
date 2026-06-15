import { AlertTriangle, ClipboardCheck, ClipboardList, FileEdit, Truck } from 'lucide-react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { SoBranchKpi, SoHqKpi } from '../model/filter-sales-orders'

export function SoHqKpiCards({ kpi }: { kpi: SoHqKpi }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        footer="최근 30일 기준"
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label="전체 요청"
        metric={formatNumber(kpi.totalCount)}
      />
      <FgKpiCard
        icon={<ClipboardCheck aria-hidden className="h-4 w-4" />}
        label="승인 대기"
        metric={<span className="text-primary-strong">{formatNumber(kpi.pendingApprovalCount)}</span>}
        tag={<FgBadge variant="primary">검토 필요</FgBadge>}
        tone="primary"
      />
      <FgKpiCard
        footer="승인 완료 · 출고 전"
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="출고 대기"
        metric={formatNumber(kpi.pendingShipCount)}
      />
      <FgKpiCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="지연"
        metric={<span className="text-danger">{formatNumber(kpi.delayedCount)}</span>}
        tag={<FgBadge variant="danger">희망일 초과</FgBadge>}
        tone="warning"
      />
    </div>
  )
}

export function SoBranchKpiCards({ kpi }: { kpi: SoBranchKpi }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        icon={<ClipboardList aria-hidden className="h-4 w-4" />}
        label="전체 요청"
        metric={formatNumber(kpi.totalCount)}
      />
      <FgKpiCard
        footer="작성 중"
        icon={<FileEdit aria-hidden className="h-4 w-4" />}
        label="임시저장"
        metric={formatNumber(kpi.draftCount)}
      />
      <FgKpiCard
        footer="본사 검토 중"
        icon={<ClipboardCheck aria-hidden className="h-4 w-4" />}
        label="출고 대기"
        metric={formatNumber(kpi.requestedCount)}
      />
      <FgKpiCard
        footer="출고 완료 및 미수령"
        icon={<Truck aria-hidden className="h-4 w-4" />}
        label="도착 대기"
        metric={
          kpi.approvedCount > 0 ? (
            <span className="text-primary-strong">{formatNumber(kpi.approvedCount)}</span>
          ) : (
            formatNumber(kpi.approvedCount)
          )
        }
        tone={kpi.approvedCount > 0 ? 'primary' : undefined}
      />
    </div>
  )
}
