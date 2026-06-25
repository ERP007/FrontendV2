import dayjs from 'dayjs'
import { ArrowDown, ArrowUp, ChevronsUpDown, MessageSquareText, RefreshCw, Warehouse as WarehouseIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatDelta, formatNumber } from '@/shared/lib/format'
import {
  FgEmptyState,
  FgModal,
  FgTable,
  FgTableCell,
  FgTableContainer,
  FgTableHead,
  FgTableHeader,
  FgTableRow,
} from '@/shared/ui'

import { groupMovementsByDate } from '../model/filter-movements'
import { movementSourceLabel } from '../model/types'
import { MovementTypeBadge } from './StockBadges'

import type { Movement, MovementSort, MovementSortField } from '../model/types'

const COLUMN_COUNT = 7

/** 메모(note)가 비어있지 않으면 true — 담당자 열의 '메모 보기' 버튼 노출 조건. */
function hasNote(movement: Movement): boolean {
  return movement.note != null && movement.note.trim().length > 0
}

interface SortableHeadProps {
  className?: string
  field: MovementSortField
  label: string
  onSortChange: (field: MovementSortField) => void
  sort: MovementSort
}

/** 헤더 클릭으로 정렬을 토글하는 셀. 백엔드 지원 + UI 노출 컬럼(일시)에만 사용한다. */
function SortableHead({ className, field, label, onSortChange, sort }: SortableHeadProps) {
  const active = sort.field === field
  const Icon = !active ? ChevronsUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <FgTableHead
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('p-0', className)}
    >
      <button
        className={cn(
          'flex h-11 w-full items-center justify-start gap-1 whitespace-nowrap px-5 font-semibold transition-colors hover:text-ink-2',
          active ? 'text-ink-2' : 'text-faint',
        )}
        type="button"
        onClick={() => onSortChange(field)}
      >
        {label}
        <Icon aria-hidden className="h-3.5 w-3.5" />
      </button>
    </FgTableHead>
  )
}

interface MovementRowProps {
  movement: Movement
  onNoteClick: (movement: Movement) => void
}

function MovementRow({ movement, onNoteClick }: MovementRowProps) {
  // 수행자는 사번이 아니라 이름으로 표시한다(executorName은 응답에 항상 포함).
  const executor = movement.executorName

  return (
    <FgTableRow>
      <FgTableCell className="whitespace-nowrap font-semibold text-muted">
        {dayjs(movement.occurredAt).format('HH:mm:ss')}
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
        <span className="flex flex-col gap-0.5">
          <span className="font-medium text-ink-2">{movementSourceLabel(movement)}</span>
          <span className="text-meta font-medium text-faint">{movement.sourceRef}</span>
        </span>
      </FgTableCell>
      <FgTableCell>
        <span className="flex items-center gap-2">
          <span className="font-medium text-ink-2">{executor}</span>
          {hasNote(movement) ? (
            <button
              aria-label="메모 보기"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-muted transition-colors hover:bg-background hover:text-ink-2"
              type="button"
              onClick={() => onNoteClick(movement)}
            >
              <MessageSquareText aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
        </span>
      </FgTableCell>
    </FgTableRow>
  )
}

export interface MovementTableProps {
  error?: boolean
  loading?: boolean
  movements: Movement[]
  onRefresh: () => void
  onSortChange: (field: MovementSortField) => void
  /** 표시 기간 라벨(예: "2026-05-15 ~ 2026-06-14"). */
  periodLabel?: string
  sort: MovementSort
  totalCount: number
}

export function MovementTable({
  error = false,
  loading = false,
  movements,
  onRefresh,
  onSortChange,
  periodLabel,
  sort,
  totalCount,
}: MovementTableProps) {
  const [memoMovement, setMemoMovement] = useState<Movement | null>(null)
  // 정렬은 일시(occurredAt)만 노출하므로 표는 항상 날짜 그룹으로 묶는다.
  const groups = groupMovementsByDate(movements)

  return (
    <>
      <FgTableContainer>
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5 text-label text-muted">
          <span>
            {periodLabel ? <span className="text-faint">{periodLabel} · </span> : null}
            총 <strong className="text-ink">{formatNumber(totalCount)}</strong>건
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
                <SortableHead className="w-28" field="occurredAt" label="일시" onSortChange={onSortChange} sort={sort} />
                <FgTableHead>부품</FgTableHead>
                <FgTableHead className="w-36">창고</FgTableHead>
                <FgTableHead className="w-28">유형</FgTableHead>
                <FgTableHead className="w-28 text-right">수량</FgTableHead>
                <FgTableHead className="w-48">사유 · 원천</FgTableHead>
                <FgTableHead className="w-32">담당자</FgTableHead>
              </tr>
            </FgTableHeader>
            {error ? (
              <tbody>
                <tr>
                  <td colSpan={COLUMN_COUNT}>
                    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
                      <p className="text-label text-muted">이동 이력을 불러오지 못했습니다.</p>
                      <button
                        className="rounded-control border border-line px-3 py-1.5 text-meta font-semibold text-ink-2 transition-colors hover:bg-background"
                        type="button"
                        onClick={onRefresh}
                      >
                        다시 시도
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : loading && movements.length === 0 ? (
              <tbody>
                <tr>
                  <td className="px-5 py-14 text-center text-label text-muted" colSpan={COLUMN_COUNT}>
                    이동 이력을 불러오는 중…
                  </td>
                </tr>
              </tbody>
            ) : movements.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={COLUMN_COUNT}>
                    <FgEmptyState description="기간 또는 필터를 변경해 보세요" title="조회된 이동 이력이 없습니다" />
                  </td>
                </tr>
              </tbody>
            ) : (
              groups.map((group) => (
                <tbody key={group.date} className="divide-y divide-line-soft">
                  <tr className="border-y border-line-soft bg-background">
                    <td className="px-5 py-2.5" colSpan={COLUMN_COUNT}>
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
                    <MovementRow key={movement.id} movement={movement} onNoteClick={setMemoMovement} />
                  ))}
                </tbody>
              ))
            )}
          </FgTable>
        </div>
      </FgTableContainer>
      <FgModal
        description={
          memoMovement
            ? `${memoMovement.itemName} · ${dayjs(memoMovement.occurredAt).format('YYYY-MM-DD HH:mm')}`
            : undefined
        }
        icon={<MessageSquareText aria-hidden className="h-5 w-5" />}
        open={memoMovement !== null}
        size="sm"
        title="메모"
        onOpenChange={(open) => {
          if (!open) {
            setMemoMovement(null)
          }
        }}
      >
        <p className="whitespace-pre-wrap break-words text-label text-ink-2">{memoMovement?.note}</p>
      </FgModal>
    </>
  )
}
