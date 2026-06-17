import { AlertTriangle, Check, Lock } from 'lucide-react'

import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { FgStepper } from '@/shared/ui'

import type { SalesOrderLine } from '../model/so-ui-model'

function LineName({ line }: { line: SalesOrderLine }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate text-label font-bold text-ink">{line.itemName}</span>
      <span className="block text-meta font-medium text-faint">{line.sku}</span>
    </span>
  )
}

function HeaderRow({ labels }: { labels: Array<{ className: string; label: string }> }) {
  return (
    <div className="flex items-center gap-3 rounded-t-control border border-line bg-background px-4 py-3 text-table text-faint">
      <span className="flex-1">부품</span>
      {labels.map((column) => (
        <span key={column.label} className={column.className}>
          {column.label}
        </span>
      ))}
    </div>
  )
}

/** SO-02 요청 품목 검토 테이블 — 승인 수량 조정 */
export interface SoReviewLinesProps {
  approvedMap: Record<number, number>
  lines: SalesOrderLine[]
  onChangeApproved: (lineNo: number, quantity: number) => void
  readOnly?: boolean
}

export function SoReviewLines({ approvedMap, lines, onChangeApproved, readOnly = false }: SoReviewLinesProps) {
  return (
    <div>
      <HeaderRow
        labels={[
          { className: 'w-14 text-center', label: '단위' },
          { className: 'w-20 text-right', label: '요청 수량' },
          { className: 'w-36 text-center', label: '승인 수량' },
          { className: 'w-28 text-right', label: '가용 재고' },
          { className: 'w-24 text-center', label: '상태' },
        ]}
      />
      <div className="divide-y divide-line-soft rounded-b-control border-x border-b border-line">
        {lines.map((line) => {
          const approved = approvedMap[line.lineNo] ?? line.requestedQuantity
          const short = line.requestedQuantity > line.availableStock

          return (
            <div key={line.lineNo} className="flex items-center gap-3 px-4 py-3.5">
              <LineName line={line} />
              <span className="w-14 text-center text-label font-medium text-ink-2">{line.unit}</span>
              <span className="w-20 text-right text-label font-bold text-ink">
                {formatNumber(line.requestedQuantity)}
              </span>
              <span className="flex w-36 justify-center">
                <FgStepper
                  disabled={readOnly}
                  max={line.requestedQuantity}
                  tone={short ? 'warning' : 'default'}
                  value={approved}
                  onChange={(value) => onChangeApproved(line.lineNo, value)}
                />
              </span>
              <span className="w-28 text-right">
                <span className={cn('text-label font-bold', short ? 'text-danger' : 'text-ink')}>
                  {formatNumber(line.availableStock)}
                  <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
                </span>
                <span className={cn('block text-meta font-semibold', short ? 'text-danger' : 'text-success')}>
                  {short ? `부족 ${formatNumber(line.availableStock - line.requestedQuantity)}` : '충분'}
                </span>
              </span>
              <span className="w-24 text-center">
                {short ? (
                  <span className="inline-flex items-center gap-1 text-meta font-bold text-warning">
                    <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
                    재고 부족
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-meta font-bold text-success">
                    <Check aria-hidden className="h-3.5 w-3.5" />
                    승인 가능
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** SO-03 출고 품목 테이블 — 출고 수량 조정 + 잔여 차감 미리보기 */
export interface SoShipLinesProps {
  lines: SalesOrderLine[]
  onChangeShipped: (lineNo: number, quantity: number) => void
  shippedMap: Record<number, number>
}

export function SoShipLines({ lines, onChangeShipped, shippedMap }: SoShipLinesProps) {
  return (
    <div>
      <HeaderRow
        labels={[
          { className: 'w-14 text-center', label: '단위' },
          { className: 'w-20 text-right', label: '승인 수량' },
          { className: 'w-36 text-center', label: '출고 수량' },
          { className: 'w-24 text-right', label: '현재고' },
          { className: 'w-36 text-right', label: '잔여 차감 후' },
        ]}
      />
      <div className="divide-y divide-line-soft rounded-b-control border-x border-b border-line">
        {lines.map((line) => {
          const approved = line.approvedQuantity ?? line.requestedQuantity
          const shipped = shippedMap[line.lineNo] ?? approved
          const remaining = line.availableStock - shipped
          const negative = remaining < 0

          return (
            <div key={line.lineNo} className="flex items-center gap-3 px-4 py-3.5">
              <LineName line={line} />
              <span className="w-14 text-center text-label font-medium text-ink-2">{line.unit}</span>
              <span className="w-20 text-right text-label font-bold text-ink">{formatNumber(approved)}</span>
              <span className="flex w-36 justify-center">
                <FgStepper
                  tone={negative ? 'warning' : 'default'}
                  value={shipped}
                  onChange={(value) => onChangeShipped(line.lineNo, value)}
                />
              </span>
              <span className="w-24 text-right text-label font-bold">
                <span className={cn(line.availableStock < shipped ? 'text-danger' : 'text-ink')}>
                  {formatNumber(line.availableStock)}
                </span>
                <span className="ml-1 text-meta font-medium text-faint">{line.unit}</span>
              </span>
              <span
                className={cn(
                  'w-36 text-right text-label font-semibold',
                  negative ? 'text-danger' : 'text-muted',
                )}
              >
                {formatNumber(line.availableStock)} − {formatNumber(shipped)} →{' '}
                <strong className={negative ? 'text-danger' : 'text-ink'}>{formatNumber(remaining)}</strong>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** SO-06 도착 품목 확인 테이블 — 도착 수량 카운트 + 차이 표시 */
export interface SoArrivalLinesProps {
  deliveredMap: Record<number, number>
  lines: SalesOrderLine[]
  onChangeDelivered: (lineNo: number, quantity: number) => void
}

export function SoArrivalLines({ deliveredMap, lines, onChangeDelivered }: SoArrivalLinesProps) {
  return (
    <div>
      <HeaderRow
        labels={[
          { className: 'w-14 text-center', label: '단위' },
          { className: 'w-20 text-right', label: '출고 수량' },
          { className: 'w-36 text-center', label: '도착 수량' },
          { className: 'w-20 text-right', label: '차이' },
          { className: 'w-24 text-center', label: '상태' },
        ]}
      />
      <div className="divide-y divide-line-soft rounded-b-control border-x border-b border-line">
        {lines.map((line) => {
          const shipped = line.shippedQuantity ?? line.approvedQuantity ?? line.requestedQuantity
          const delivered = deliveredMap[line.lineNo] ?? shipped
          const diff = delivered - shipped
          const hasDiff = diff !== 0

          return (
            <div
              key={line.lineNo}
              className={cn('flex items-center gap-3 px-4 py-3.5', hasDiff && 'bg-warm')}
            >
              <LineName line={line} />
              <span className="w-14 text-center text-label font-medium text-ink-2">{line.unit}</span>
              <span className="w-20 text-right text-label font-bold text-ink">{formatNumber(shipped)}</span>
              <span className="flex w-36 justify-center">
                <FgStepper
                  tone={hasDiff ? 'warning' : 'default'}
                  value={delivered}
                  onChange={(value) => onChangeDelivered(line.lineNo, value)}
                />
              </span>
              <span
                className={cn(
                  'w-20 text-right text-label font-bold',
                  hasDiff ? 'text-danger' : 'text-faint',
                )}
              >
                {diff === 0 ? '±0' : formatNumber(diff)}
              </span>
              <span className="w-24 text-center">
                {hasDiff ? (
                  <span className="inline-flex items-center gap-1 text-meta font-bold text-warning">
                    <AlertTriangle aria-hidden className="h-3.5 w-3.5" />
                    차이 발생
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-meta font-bold text-success">
                    <Check aria-hidden className="h-3.5 w-3.5" />
                    정상
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** 요청 메모 박스 (SO-02) */
export function SoNoteBox({ note }: { note: string }) {
  return (
    <div className="mt-4 flex gap-3 rounded-control bg-background px-4 py-3.5">
      <span className="w-1 shrink-0 rounded-pill bg-primary" />
      <div>
        <p className="flex items-center gap-1.5 text-meta font-semibold text-faint">
          <Lock aria-hidden className="h-3 w-3" />
          요청 메모
        </p>
        <p className="mt-1 text-label font-medium text-ink-2">{note}</p>
      </div>
    </div>
  )
}
