import { AlertTriangle, Boxes, Gauge, History } from 'lucide-react'
import type { KeyboardEvent } from 'react'

import { formatNumber } from '@/shared/lib/format'
import { FgBadge, FgKpiCard } from '@/shared/ui'

import type { StockFilter, StockKpi } from '../model/types'

export interface StockKpiCardsProps {
  kpi: StockKpi
  /** 제공 시 '최근 7일 이동' 카드가 클릭 가능해진다(이력 페이지로 이동, 최근 7일 필터). */
  onRecentMovementsClick?: () => void
  /** 제공 시 총 SKU/부족 재고 카드가 클릭 가능해진다(해당 상태로 필터). */
  onStatusSelect?: (status: StockFilter['status']) => void
}

/** 클릭 가능한 카드에 부여할 접근성·핸들러 props. handler가 없으면 비클릭 카드로 둔다. */
function clickableProps(handler: (() => void) | undefined, label: string) {
  if (!handler) return {}
  return {
    'aria-label': label,
    className: 'cursor-pointer transition-shadow hover:shadow-popover',
    role: 'button' as const,
    tabIndex: 0,
    onClick: handler,
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handler()
      }
    },
  }
}

export function StockKpiCards({ kpi, onRecentMovementsClick, onStatusSelect }: StockKpiCardsProps) {
  const select = (status: StockFilter['status']) =>
    onStatusSelect ? () => onStatusSelect(status) : undefined

  // 충족률(%) = 정상 ÷ 총. 신 백엔드의 fulfillmentRate를 우선 쓰고, 없으면(구 백엔드) total·low·무재고로 유도한다.
  const normalCount = kpi.totalSkuCount - kpi.lowStockCount - (kpi.noStockCount ?? 0)
  const fulfillmentRate =
    kpi.fulfillmentRate ??
    (kpi.totalSkuCount > 0 ? Math.round((normalCount / kpi.totalSkuCount) * 1000) / 10 : 0)

  return (
    <div className="grid grid-cols-4 gap-5">
      <FgKpiCard
        footer="부품 × 창고 재고 포지션"
        icon={<Boxes aria-hidden className="h-4 w-4" />}
        label="총 SKU"
        metric={formatNumber(kpi.totalSkuCount)}
        {...clickableProps(select('ALL'), '전체 재고 보기')}
      />
      <FgKpiCard
        icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        label="부족 재고"
        metric={<span className="text-warning">{formatNumber(kpi.lowStockCount)}</span>}
        tag={<FgBadge variant="warning">안전재고 미만</FgBadge>}
        tone="warning"
        {...clickableProps(select('LOW'), '부족 재고만 보기')}
      />
      <FgKpiCard
        footer="정상 ÷ 전체 포지션"
        icon={<Gauge aria-hidden className="h-4 w-4" />}
        label="안전재고 충족률"
        metric={`${fulfillmentRate.toFixed(1)}%`}
      />
      <FgKpiCard
        footer="입고 · 출고 · 조정 전체"
        icon={<History aria-hidden className="h-4 w-4" />}
        label="최근 7일 이동"
        metric={formatNumber(kpi.recentAdjustCount)}
        {...clickableProps(onRecentMovementsClick, '최근 7일 이동 이력 보기')}
      />
    </div>
  )
}
