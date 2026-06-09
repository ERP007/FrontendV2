import { AlertTriangle, CheckCircle2, Info, Lock } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type FgNoticeTone = 'info' | 'success' | 'warning' | 'danger' | 'locked'

const toneClasses: Record<FgNoticeTone, string> = {
  info: 'border-primary-line bg-primary-soft text-primary-strong',
  success: 'border-success-bg bg-success-bg text-success',
  warning: 'border-warning-bg bg-warning-bg text-warning',
  danger: 'border-danger-bg bg-danger-bg text-danger',
  locked: 'border-primary-line bg-primary-soft text-primary-strong',
}

const toneIcons: Record<FgNoticeTone, ReactNode> = {
  info: <Info aria-hidden className="h-4 w-4" />,
  success: <CheckCircle2 aria-hidden className="h-4 w-4" />,
  warning: <AlertTriangle aria-hidden className="h-4 w-4" />,
  danger: <AlertTriangle aria-hidden className="h-4 w-4" />,
  locked: <Lock aria-hidden className="h-4 w-4" />,
}

export interface FgNoticeProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  tone?: FgNoticeTone
}

export function FgNotice({ children, className, icon, tone = 'info', ...props }: FgNoticeProps) {
  return (
    <div
      className={cn('flex items-center gap-2 rounded-control border px-3.5 py-3 text-label', toneClasses[tone], className)}
      role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}
      {...props}
    >
      {icon ?? toneIcons[tone]}
      <span>{children}</span>
    </div>
  )
}
