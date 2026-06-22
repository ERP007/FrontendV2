import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgButton } from '@/shared/ui/FgButton'

type FgModalSize = 'sm' | 'md' | 'lg'

const modalSizeClasses: Record<FgModalSize, string> = {
  sm: 'max-w-modal-sm',
  md: 'max-w-modal-md',
  lg: 'max-w-modal-lg',
}

export interface FgModalProps {
  children: ReactNode
  className?: string
  description?: ReactNode
  footer?: ReactNode
  headerActions?: ReactNode
  icon?: ReactNode
  onOpenChange?: (open: boolean) => void
  open?: boolean
  size?: FgModalSize
  title: ReactNode
  titleMeta?: ReactNode
  trigger?: ReactNode
}

export function FgModal({
  children,
  className,
  description,
  footer,
  headerActions,
  icon,
  onOpenChange,
  open,
  size = 'md',
  title,
  titleMeta,
  trigger,
}: FgModalProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-modal-backdrop backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-20 z-50 flex max-h-modal w-full -translate-x-1/2 flex-col overflow-hidden rounded-modal border border-line bg-surface shadow-modal',
            modalSizeClasses[size],
            className,
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
            <div className="min-w-0">
              <Dialog.Title className="flex min-w-0 items-center gap-2 text-modal-title text-ink">
                {icon}
                <span className="truncate">{title}</span>
                {titleMeta}
              </Dialog.Title>
              <div className="mt-3 h-1 w-9 rounded-pill bg-primary" />
              {description ? (
                <Dialog.Description className="mt-3 text-label text-muted">{description}</Dialog.Description>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerActions}
              <Dialog.Close asChild>
                <FgButton aria-label="닫기" size="icon" variant="default">
                  <X aria-hidden className="h-5 w-5" />
                </FgButton>
              </Dialog.Close>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 fg-scrollbar">{children}</div>
          {footer ? <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line-soft bg-background px-6 py-4">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
