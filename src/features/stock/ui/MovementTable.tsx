import { RefreshCw, Warehouse as WarehouseIcon } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatDelta, formatNumber } from '@/shared/lib/format'
import {
  FgAvatar,
  FgEmptyState,
  FgTable,
  FgTableCell,
  FgTableContainer,
  FgTableHead,
  FgTableHeader,
  FgTableRow,
} from '@/shared/ui'

import { movementSourceLabel } from '../model/types'
import { MovementTypeBadge } from './StockBadges'

import type { MovementDateGroup } from '../model/filter-movements'

function formatClock(occurredAt: string): string {
  return occurredAt.slice(11, 19)
}

export interface MovementTableProps {
  groups: MovementDateGroup[]
  onRefresh: () => void
  totalCount: number
}

export function MovementTable({ groups, onRefresh, totalCount }: MovementTableProps) {
  return (
    <FgTableContainer>
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5 text-label text-muted">
        <span>
          기간 내 <strong className="text-ink">{formatNumber(totalCount)}</strong>건
        </span>
        <button
          className="flex items-center gap-1.5 text-meta font-semibold text-muted transition-colors hover:text-ink-2"
          type="button"
          onClick={onRefresh}
        >
          <RefreshCw aria-hidden className="h-3.5 w-3.5" />
          새로고침
        </button>
      </div>
      <div className="overflow-x-auto fg-scrollbar">
        <FgTable>
          <FgTableHeader>
            <tr>
              <FgTableHead className="w-24">시간</FgTableHead>
              <FgTableHead>부품</FgTableHead>
              <FgTableHead className="w-36">창고</FgTableHead>
              <FgTableHead className="w-28">유형</FgTableHead>
              <FgTableHead className="w-28 text-right">수량</FgTableHead>
              <FgTableHead className="w-48">사유 · 원천</FgTableHead>
              <FgTableHead className="w-32">담당자</FgTableHead>
            </tr>
          </FgTableHeader>
          {groups.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7}>
                  <FgEmptyState
                    description="기간 또는 필터를 변경해 보세요"
                    title="조회된 이동 이력이 없습니다"
                  />
                </td>
              </tr>
            </tbody>
          ) : (
            groups.map((group) => (
              <tbody key={group.date} className="divide-y divide-line-soft">
                <tr className="border-y border-line-soft bg-background">
                  <td className="px-5 py-2.5" colSpan={7}>
                    <span className="flex items-center gap-2.5 text-label">
                      <strong className="font-bold text-ink-2">
                        {group.date}
                        {group.isToday ? <span className="ml-1.5 text-primary-strong">(오늘)</span> : null}
                      </strong>
                      <span className="rounded-pill bg-line-soft px-2 py-0.5 text-badge text-muted">
                        {group.count}건
                      </span>
                    </span>
                  </td>
                </tr>
                {group.movements.map((movement) => (
                  <FgTableRow key={movement.id}>
                    <FgTableCell className="font-semibold text-muted">
                      {formatClock(movement.occurredAt)}
                    </FgTableCell>
                    <FgTableCell>
                      <span className="flex items-center gap-2.5">
                        <span className="truncate font-semibold text-ink">{movement.itemName}</span>
                        <span className="shrink-0 text-meta font-medium text-faint">{movement.sku}</span>
                      </span>
                    </FgTableCell>
                    <FgTableCell>
                      <span className="flex items-center gap-1.5 font-medium text-ink-2">
                        <WarehouseIcon aria-hidden className="h-3.5 w-3.5 text-faint" />
                        {movement.warehouseName}
                      </span>
                    </FgTableCell>
                    <FgTableCell>
                      <MovementTypeBadge type={movement.type} />
                    </FgTableCell>
                    <FgTableCell className="text-right">
                      <span className={cn('font-bold', movement.delta < 0 ? 'text-danger' : 'text-success')}>
                        {formatDelta(movement.delta)}
                      </span>
                      <span className="ml-1 text-meta font-medium text-faint">{movement.unit}</span>
                    </FgTableCell>
                    <FgTableCell>
                      <span className="font-medium text-ink-2">{movementSourceLabel(movement)}</span>
                      <span className="ml-2 text-meta font-medium text-faint">{movement.sourceRef}</span>
                    </FgTableCell>
                    <FgTableCell>
                      <span className="flex items-center gap-2">
                        <FgAvatar fallback={movement.executorName} size="sm" />
                        <span className="font-medium text-ink-2">{movement.executorName}</span>
                      </span>
                    </FgTableCell>
                  </FgTableRow>
                ))}
              </tbody>
            ))
          )}
        </FgTable>
      </div>
    </FgTableContainer>
  )
}
