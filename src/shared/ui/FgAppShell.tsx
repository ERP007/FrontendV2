import {
  Bell,
  ChevronDown,
  Package,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { FgAvatar } from '@/shared/ui/FgAvatar'
import { FgButton } from '@/shared/ui/FgButton'
import { FgDropdownMenu } from '@/shared/ui/FgDropdownMenu'

import type { FgDropdownItem } from '@/shared/ui/FgDropdownMenu'

export interface FgNavItem {
  active?: boolean
  children?: FgNavItem[]
  href?: string
  icon?: ReactNode
  label: ReactNode
  onClick?: () => void
}

export interface FgNavGroup {
  items: FgNavItem[]
  label?: string
}

export interface FgAppShellProps {
  bottomItems?: FgNavItem[]
  children: ReactNode
  navGroups: FgNavGroup[]
  profileMenuItems?: FgDropdownItem[]
  searchPlaceholder?: string
  userName?: string
  userRole?: string
}

function FgSidebarItem({ active = false, children, href, icon, label, onClick }: FgNavItem) {
  const hasActiveChild = children?.some((child) => child.active) ?? false
  const [open, setOpen] = useState(hasActiveChild)

  const className = cn(
    'flex w-full items-center gap-3 rounded-nav px-3 py-2.5 text-left text-sm font-medium text-ink-2 transition-colors',
    'hover:bg-background hover:text-primary-strong',
    active && 'bg-primary-soft font-bold text-primary-strong shadow-selected',
  )

  if (children?.length) {
    const expanded = open || hasActiveChild

    return (
      <div>
        <button
          aria-expanded={expanded}
          className={cn(className, hasActiveChild && 'font-bold text-primary-strong')}
          type="button"
          onClick={() => setOpen((previous) => !previous)}
        >
          <span className={cn('text-muted', hasActiveChild && 'text-primary')}>{icon}</span>
          <span className="flex-1 truncate">{label}</span>
          <ChevronDown
            aria-hidden
            className={cn('h-3.5 w-3.5 text-faint transition-transform', expanded && 'rotate-180')}
          />
        </button>
        {expanded ? (
          <div className="mt-1 space-y-1 pl-9">
            {children.map((child, childIndex) => (
              <FgSidebarItem key={childIndex} {...child} />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const content = (
    <>
      {icon ? <span className={cn('text-muted', active && 'text-primary')}>{icon}</span> : null}
      <span className="truncate">{label}</span>
    </>
  )

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {content}
    </button>
  )
}

export function FgAppShell({
  bottomItems,
  children,
  navGroups,
  profileMenuItems,
  searchPlaceholder = '부품 코드, 사용자, 발주 번호 검색',
  userName = '김정수',
  userRole = '지점 관리자',
}: FgAppShellProps) {
  const profileTrigger = (
    <button
      aria-label="사용자 메뉴"
      className="flex items-center gap-3 rounded-control px-1.5 py-1 text-left transition-colors hover:bg-background focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-background"
      type="button"
    >
      <FgAvatar size="md" />
      <span>
        <strong className="block text-label text-ink">{userName}</strong>
        <span className="block text-micro normal-case text-faint">{userRole}</span>
      </span>
      <ChevronDown aria-hidden className="h-4 w-4 text-faint" />
    </button>
  )

  return (
    <div className="fg-page flex">
      <aside className="flex min-h-screen w-sidebar shrink-0 flex-col border-r border-line bg-surface px-4 py-6">
        <div className="mb-6 flex items-center gap-3 px-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-nav bg-navy text-surface">
            <Package aria-hidden className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-micro text-faint">현대오토에버</span>
            <strong className="block truncate text-body font-extrabold text-ink">부품물류 ERP</strong>
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-5">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {group.label ? <p className="px-3 pb-2 text-micro text-faint">{group.label}</p> : null}
              {group.items.map((item, itemIndex) => (
                <FgSidebarItem key={itemIndex} {...item} />
              ))}
            </div>
          ))}
        </nav>
        {bottomItems?.length ? (
          <div className="mt-5 space-y-1 border-t border-line-soft pt-4">
            {bottomItems.map((item, itemIndex) => (
              <FgSidebarItem key={itemIndex} {...item} />
            ))}
          </div>
        ) : null}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-topbar shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-7">
          <label className="flex h-10 w-80 items-center gap-3 rounded-nav border border-line bg-background px-3 text-label text-muted">
            <Search aria-hidden className="h-4 w-4 text-faint" />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint"
              placeholder={searchPlaceholder}
              type="search"
            />
          </label>
          <div className="flex items-center gap-4">
            <FgButton aria-label="알림" className="relative" size="icon" variant="default">
              <Bell aria-hidden className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-pill bg-warning-dot" />
            </FgButton>
            <span className="h-6 w-px bg-line" />
            {profileMenuItems?.length ? (
              <FgDropdownMenu align="end" items={profileMenuItems} trigger={profileTrigger} />
            ) : (
              profileTrigger
            )}
          </div>
        </header>
        <main className="min-w-0 flex-1 bg-background px-10 py-9">{children}</main>
      </div>
    </div>
  )
}
