import { Ban, Check, Clock, Edit3, List, Truck, X } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type FgBadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'off' | 'danger' | 'navy' | 'outline'

const badgeVariantClasses: Record<FgBadgeVariant, string> = {
  default: 'border-line bg-line-soft text-ink-2',
  primary: 'border-primary-line bg-primary-soft text-primary-strong',
  success: 'border-success-bg bg-success-bg text-success',
  warning: 'border-warning-bg bg-warning-bg text-warning',
  off: 'border-off-bg bg-off-bg text-off',
  danger: 'border-danger-bg bg-danger-bg text-danger',
  navy: 'border-navy bg-navy text-surface',
  outline: 'border-line bg-surface text-ink-2',
}

export interface FgBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  dot?: boolean
  icon?: ReactNode
  variant?: FgBadgeVariant
}

export function FgBadge({ children, className, dot = false, icon, variant = 'default', ...props }: FgBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-badge',
        badgeVariantClasses[variant],
        className,
      )}
      {...props}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-pill bg-current" /> : null}
      {icon}
      {children}
    </span>
  )
}

type FgUserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'

const userStatusMap: Record<FgUserStatus, { label: string; variant: FgBadgeVariant }> = {
  ACTIVE: { label: 'ACTIVE', variant: 'success' },
  PENDING: { label: 'PENDING', variant: 'warning' },
  SUSPENDED: { label: 'SUSPENDED', variant: 'off' },
}

export interface FgStatusBadgeProps extends Omit<FgBadgeProps, 'children' | 'variant'> {
  label?: string
  status: FgUserStatus
}

export function FgStatusBadge({ label, status, ...props }: FgStatusBadgeProps) {
  const statusInfo = userStatusMap[status]

  return (
    <FgBadge dot variant={statusInfo.variant} {...props}>
      {label ?? statusInfo.label}
    </FgBadge>
  )
}

type FgDomainStatus =
  | 'APPROVED'
  | 'REQUESTED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RECEIVED'
  | 'DRAFT'
  | 'CANCELED'
  | 'REJECTED'
  | 'EDITED'

const domainStatusMap: Record<FgDomainStatus, { icon: ReactNode; variant: FgBadgeVariant }> = {
  APPROVED: { icon: <Check aria-hidden className="h-3.5 w-3.5" />, variant: 'success' },
  REQUESTED: { icon: <Clock aria-hidden className="h-3.5 w-3.5" />, variant: 'primary' },
  SHIPPED: { icon: <Truck aria-hidden className="h-3.5 w-3.5" />, variant: 'navy' },
  DELIVERED: { icon: <Check aria-hidden className="h-3.5 w-3.5" />, variant: 'navy' },
  RECEIVED: { icon: <Check aria-hidden className="h-3.5 w-3.5" />, variant: 'navy' },
  DRAFT: { icon: <List aria-hidden className="h-3.5 w-3.5" />, variant: 'outline' },
  CANCELED: { icon: <Ban aria-hidden className="h-3.5 w-3.5" />, variant: 'off' },
  REJECTED: { icon: <X aria-hidden className="h-3.5 w-3.5" />, variant: 'danger' },
  EDITED: { icon: <Edit3 aria-hidden className="h-3.5 w-3.5" />, variant: 'outline' },
}

export interface FgDomainStatusBadgeProps extends Omit<FgBadgeProps, 'children' | 'icon' | 'variant'> {
  label?: string
  status: FgDomainStatus
}

export function FgDomainStatusBadge({ className, label, status, ...props }: FgDomainStatusBadgeProps) {
  const statusInfo = domainStatusMap[status]

  return (
    <FgBadge
      className={cn(status === 'CANCELED' && 'border-dashed', className)}
      icon={statusInfo.icon}
      variant={statusInfo.variant}
      {...props}
    >
      {label ?? status}
    </FgBadge>
  )
}
