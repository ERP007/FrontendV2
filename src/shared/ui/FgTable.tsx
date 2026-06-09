import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

export function FgTableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-hidden rounded-card border border-line bg-surface shadow-card', className)} {...props} />
}

export function FgTable({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full border-collapse text-left text-body text-ink', className)} {...props} />
}

export function FgTableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-background text-table text-faint', className)} {...props} />
}

export function FgTableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-line-soft', className)} {...props} />
}

export interface FgTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean
}

export function FgTableRow({ className, selected = false, ...props }: FgTableRowProps) {
  return (
    <tr
      className={cn(
        'relative transition-colors hover:bg-background',
        selected && 'bg-primary-soft shadow-selected',
        className,
      )}
      {...props}
    />
  )
}

export function FgTableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-11 px-5 font-semibold text-faint', className)} {...props} />
}

export function FgTableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('h-14 px-5 align-middle font-semibold text-ink', className)} {...props} />
}
