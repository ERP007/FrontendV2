import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgBreadcrumbItem {
  label: ReactNode
}

export interface FgPageHeaderProps {
  actions?: ReactNode
  badge?: ReactNode
  breadcrumbs?: FgBreadcrumbItem[]
  className?: string
  description?: ReactNode
  title: ReactNode
}

export function FgPageHeader({
  actions,
  badge,
  breadcrumbs,
  className,
  description,
  title,
}: FgPageHeaderProps) {
  return (
    <header className={cn('mb-7 flex items-end justify-between gap-6', className)}>
      <div className="min-w-0">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-label text-faint">
            {breadcrumbs.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                <span className={cn(index === breadcrumbs.length - 1 && 'font-semibold text-ink-2')}>{item.label}</span>
                {index < breadcrumbs.length - 1 ? <ChevronRight aria-hidden className="h-3.5 w-3.5" /> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-h1 text-ink">{title}</h1>
          {badge}
        </div>
        <div className="mt-3 h-1 w-9 rounded-pill bg-primary" />
        {description ? <p className="mt-3 text-label text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </header>
  )
}
