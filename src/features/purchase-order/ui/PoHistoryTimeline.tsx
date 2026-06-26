import { Clock, User as UserIcon } from 'lucide-react'

import { FgCard, FgCardHeader, FgDomainStatusBadge } from '@/shared/ui'

import type { PurchaseOrderHistoryRow } from '../model/po-history'

export interface PoHistoryTimelineProps {
  rows: PurchaseOrderHistoryRow[]
  title?: string
}

export function PoHistoryTimeline({ rows, title = '변경 이력' }: PoHistoryTimelineProps) {
  return (
    <FgCard className="h-fit" compact>
      <FgCardHeader icon={<Clock aria-hidden className="h-4 w-4" />} title={title} />
      {rows.length === 0 ? (
        <p className="text-meta font-medium text-faint">이력이 없습니다.</p>
      ) : (
        <ol className="relative space-y-6 border-l border-line-soft pl-5">
          {rows.map((row, index) => (
            <li key={`${row.changedAt}-${index}`} className="relative">
              <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-pill border-2 border-surface bg-primary" />
              <div className="flex items-center gap-2.5">
                <FgDomainStatusBadge label={row.statusLabel} status={row.status} />
                <span className="text-meta font-medium text-faint">{row.changedAtLabel}</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-label font-semibold text-ink-2">
                <UserIcon aria-hidden className="h-3.5 w-3.5 text-faint" />
                {row.changedByLabel}
              </p>
              {row.metaLines.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5">
                  {row.metaLines.map((line) => (
                    <li key={line} className="text-meta font-medium text-faint">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </FgCard>
  )
}
