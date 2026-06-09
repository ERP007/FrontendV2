import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type FgKpiTone = 'default' | 'primary' | 'warning'

const toneClasses: Record<FgKpiTone, string> = {
  default: 'border-line bg-surface',
  primary: 'border-primary-line bg-primary-soft',
  warning: 'border-warning-bg bg-warning-bg',
}

export interface FgKpiCardProps extends HTMLAttributes<HTMLDivElement> {
  footer?: ReactNode
  icon?: ReactNode
  label: ReactNode
  metric: ReactNode
  tag?: ReactNode
  tone?: FgKpiTone
}

export function FgKpiCard({
  className,
  footer,
  icon,
  label,
  metric,
  tag,
  tone = 'default',
  ...props
}: FgKpiCardProps) {
  return (
    <section
      className={cn('flex min-h-32 flex-col gap-3 rounded-card border p-5 shadow-card', toneClasses[tone], className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-label text-muted">
          {icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary-soft text-primary">
              {icon}
            </span>
          ) : null}
          <span>{label}</span>
        </div>
        {tag}
      </div>
      <strong className="text-kpi text-ink">{metric}</strong>
      {footer ? <div className="text-meta text-faint">{footer}</div> : null}
    </section>
  )
}
