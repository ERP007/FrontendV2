import { Clock, User as UserIcon } from 'lucide-react'

import { formatDateTime } from '@/shared/lib/format'
import { FgCard, FgCardHeader, FgDomainStatusBadge } from '@/shared/ui'

import { useSalesOrderHistoriesQuery } from '../api/use-sales-order-histories-query'

export interface SoHistoryTimelineProps {
  code: string
}

export function SoHistoryTimeline({ code }: SoHistoryTimelineProps) {
  const { data: histories = [], isLoading } = useSalesOrderHistoriesQuery(code)

  return (
    <FgCard className="h-fit" compact>
      <FgCardHeader icon={<Clock aria-hidden className="h-4 w-4" />} title="변경 이력" />
      {isLoading ? (
        <p className="text-label text-muted">불러오는 중…</p>
      ) : histories.length === 0 ? (
        <p className="text-label text-muted">변경 이력이 없습니다.</p>
      ) : (
        <ol className="relative space-y-6 border-l border-line-soft pl-5">
          {histories.map((entry, index) => (
            <li key={`${entry.changedAt}-${index}`} className="relative">
              <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-pill border-2 border-surface bg-primary" />
              <div className="flex items-center gap-2.5">
                <FgDomainStatusBadge status={entry.status} />
                <span className="text-meta font-medium text-faint">
                  {formatDateTime(entry.changedAt)}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-label font-semibold text-ink-2">
                <UserIcon aria-hidden className="h-3.5 w-3.5 text-faint" />
                {entry.changedBy.name}
                <span className="font-medium text-faint">· {entry.changedBy.position}</span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </FgCard>
  )
}
