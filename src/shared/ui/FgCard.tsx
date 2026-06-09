import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

export interface FgCardProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean
}

export function FgCard({ children, className, compact = false, ...props }: FgCardProps) {
  return (
    <section
      className={cn(
        'rounded-card border border-line bg-surface shadow-card',
        compact ? 'p-5' : 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}

export interface FgCardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  actions?: ReactNode
  icon?: ReactNode
  title: ReactNode
}

export function FgCardHeader({ actions, className, icon, title, ...props }: FgCardHeaderProps) {
  return (
    <div className={cn('mb-5 flex items-center justify-between gap-4', className)} {...props}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <span className="flex h-5 w-5 items-center justify-center text-muted">{icon}</span> : null}
        <h2 className="truncate text-section text-ink">{title}</h2>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function FgCardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('min-w-0', className)} {...props} />
}

export function FgCardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mt-5 flex items-center justify-between gap-4 border-t border-line-soft pt-4', className)}
      {...props}
    />
  )
}
