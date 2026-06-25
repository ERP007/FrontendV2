import { History, ShieldCheck, SlidersHorizontal } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatDate, formatDelta, formatNumber } from '@/shared/lib/format'
import { FgBadge, FgButton, FgCard, FgEmptyState } from '@/shared/ui'

import { MovementTypeBadge } from './StockBadges'

import type { StockSkuDetail, StockStatus } from '../model/types'

const gaugeColorClasses: Record<StockStatus, string> = {
  LOW: 'bg-warning-dot',
  NORMAL: 'bg-primary',
}

export interface StockDetailPanelProps {
  canManage?: boolean
  detail: StockSkuDetail | null
  loading?: boolean
  onAdjust: () => void
  onSafetyAdjust?: () => void
  onViewHistory: () => void
}

export function StockDetailPanel({
  canManage = false,
  detail,
  loading = false,
  onAdjust,
  onSafetyAdjust,
  onViewHistory,
}: StockDetailPanelProps) {
  if (loading && !detail) {
    return (
      <FgCard className="h-fit">
        <div className="p-8 text-center text-meta text-muted">상세 정보를 불러오는 중…</div>
      </FgCard>
    )
  }

  if (!detail) {
    return (
      <FgCard className="h-fit">
        <FgEmptyState
          description="좌측 목록에서 부품을 선택하면 창고별 재고와 최근 이동이 표시됩니다"
          title="선택된 부품이 없습니다"
        />
      </FgCard>
    )
  }

  return (
    <FgCard className="flex h-fit flex-col gap-5" compact>
      <div>
        <p className="text-micro uppercase tracking-wide text-faint">선택된 부품</p>
        <h2 className="mt-2 text-modal-title text-ink">{detail.itemName}</h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="text-meta font-semibold text-muted">{detail.sku}</span>
          {detail.majorCategory ? <FgBadge variant="primary">{detail.majorCategory}</FgBadge> : null}
          {detail.middleCategory ? <FgBadge variant="outline">{detail.middleCategory}</FgBadge> : null}
        </div>
      </div>

      <div>
        <p className="mb-3 text-label font-semibold text-ink-2">창고별 재고</p>
        <div className="space-y-3">
          {detail.warehouse.map((warehouse) => {
            const ratio =
              warehouse.safetyStock > 0
                ? Math.min(100, Math.round((warehouse.quantity / warehouse.safetyStock) * 100))
                : 100

            return (
              <div key={warehouse.warehouseId}>
                <div className="flex items-center justify-between gap-2 text-label">
                  <span className="font-medium text-ink-2">{warehouse.warehouseName}</span>
                  <span
                    className={cn(
                      'font-bold',
                      warehouse.status === 'LOW' ? 'text-warning' : 'text-ink',
                    )}
                  >
                    {formatNumber(warehouse.quantity)}
                    <span className="ml-1 font-medium text-faint">/ {formatNumber(warehouse.safetyStock)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-line-soft">
                  <div
                    className={cn('h-full rounded-pill', gaugeColorClasses[warehouse.status])}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-label font-semibold text-ink-2">최근 이동 5건</p>
        </div>
        <div className="divide-y divide-line-soft">
          {detail.history.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 py-2.5">
              <span className="w-20 shrink-0 text-meta text-muted">{formatDate(entry.occurredAt)}</span>
              <MovementTypeBadge type={entry.type} />
              <span
                className={cn(
                  'flex-1 text-right text-label font-bold',
                  entry.delta < 0 ? 'text-danger' : 'text-success',
                )}
              >
                {formatDelta(entry.delta)}
              </span>
              <span className="w-14 shrink-0 text-right text-meta text-muted">{entry.executorName}</span>
            </div>
          ))}
          {detail.history.length === 0 ? (
            <p className="py-4 text-center text-meta text-faint">최근 이동 이력이 없습니다</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line-soft pt-4">
        <FgButton
          className="grow whitespace-nowrap"
          leftIcon={<History aria-hidden className="h-4 w-4" />}
          onClick={onViewHistory}
        >
          전체 이력 보기
        </FgButton>
        {canManage ? (
          <>
            <FgButton
              className="grow whitespace-nowrap"
              leftIcon={<ShieldCheck aria-hidden className="h-4 w-4" />}
              onClick={onSafetyAdjust}
            >
              안전 재고 조정
            </FgButton>
            <FgButton
              className="grow whitespace-nowrap"
              leftIcon={<SlidersHorizontal aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={onAdjust}
            >
              재고 조정
            </FgButton>
          </>
        ) : null}
      </div>
    </FgCard>
  )
}
