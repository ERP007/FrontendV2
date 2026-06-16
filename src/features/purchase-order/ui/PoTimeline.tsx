import { Clock, User as UserIcon } from 'lucide-react'

import { formatDateTime } from '@/shared/lib/format'
import { FgCard, FgCardHeader, FgDomainStatusBadge } from '@/shared/ui'

import type { PurchaseOrderEvent } from '../model/ui-mock-types'

export interface PoTimelineProps {
  events: PurchaseOrderEvent[]
  title?: string
}

export function PoTimeline({ events, title = '변경 이력' }: PoTimelineProps) {
  return (
    <FgCard className="h-fit" compact>
      <FgCardHeader
        actions={<span className="text-meta font-semibold text-primary-strong">전체</span>}
        icon={<Clock aria-hidden className="h-4 w-4" />}
        title={title}
      />
      <ol className="relative space-y-6 border-l border-line-soft pl-5">
        {events.map((event) => (
          <li key={event.id} className="relative">
            <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-pill border-2 border-surface bg-primary" />
            <div className="flex items-center gap-2.5">
              <FgDomainStatusBadge status={event.type} />
              <span className="text-meta font-medium text-faint">{formatDateTime(event.occurredAt)}</span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-label font-semibold text-ink-2">
              <UserIcon aria-hidden className="h-3.5 w-3.5 text-faint" />
              {event.actorName}
              <span className="font-medium text-faint">· {event.actorTeam}</span>
            </p>
            <p className="mt-1 text-label font-medium text-muted">{event.description}</p>
          </li>
        ))}
      </ol>
    </FgCard>
  )
}
