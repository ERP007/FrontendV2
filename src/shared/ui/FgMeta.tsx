import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgMetaProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  label: ReactNode
  value: ReactNode
}

export function FgMeta({ className, icon, label, value, ...props }: FgMetaProps) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)} {...props}>
      <dt className="flex items-center gap-1.5 text-meta text-faint">
        {icon}
        {label}
      </dt>
      <dd className="truncate text-body font-semibold text-ink">{value}</dd>
    </div>
  )
}
