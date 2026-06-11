import { Inbox } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgEmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  action?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  title: ReactNode
}

export function FgEmptyState({ action, className, description, icon, title, ...props }: FgEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-14 text-center', className)} {...props}>
      <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-line-soft text-faint">
        {icon ?? <Inbox aria-hidden className="h-6 w-6" />}
      </span>
      <p className="text-body font-semibold text-ink-2">{title}</p>
      {description ? <p className="text-meta text-faint">{description}</p> : null}
      {action}
    </div>
  )
}
