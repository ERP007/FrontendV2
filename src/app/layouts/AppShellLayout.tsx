import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Boxes,
  Building2,
  ClipboardCheck,
  ClipboardList,
  History,
  KeyRound,
  LayoutGrid,
  LogOut,
  Package,
  PackageSearch,
  Settings,
  ShoppingCart,
  Store,
  User,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { LOGOUT_URL, PASSWORD_CHANGE_URL, queryClient } from '@/shared/api'
import { useSession } from '@/shared/auth/session'
import {
  canAccessBranchScope,
  canAccessHqScope,
  canAccessUserManagement,
  roleLabel,
} from '@/shared/config/session'
import { FgAppShell } from '@/shared/ui'
import type { FgDropdownItem, FgNavGroup, FgNavItem } from '@/shared/ui'

const iconClassName = 'h-4.5 w-4.5'

export function AppShellLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { data: session } = useSession()
  const userRole = session?.userRole
  const canShowUserManagement = canAccessUserManagement(userRole)
  const canShowHqMenus = canAccessHqScope(userRole)
  const canShowBranchMenus = canAccessBranchScope(userRole)

  const item = (to: string, label: string, icon?: ReactNode): FgNavItem => ({
    active: pathname === to || pathname.startsWith(`${to}/`),
    icon,
    label,
    onClick: () => void navigate({ to }),
  })

  const salesOrderItems = [
    ...(canShowHqMenus
      ? [item('/sales-orders', '발주 요청', <ClipboardCheck aria-hidden className={iconClassName} />)]
      : []),
    ...(canShowBranchMenus
      ? [item('/branch/sales-orders', '내 지점 발주 요청', <Store aria-hidden className={iconClassName} />)]
      : []),
  ]

  const navGroups: FgNavGroup[] = [
    ...(canShowHqMenus
      ? [
          {
            items: [item('/dashboard', '본사 대시보드', <LayoutGrid aria-hidden className={iconClassName} />)],
          },
        ]
      : []),
    {
      label: '물류 운영',
      items: [
        {
          children: [
            item('/stocks', '재고 조회', <Boxes aria-hidden className={iconClassName} />),
            item('/stock-movements', '재고 이력', <History aria-hidden className={iconClassName} />),
          ],
          icon: <Package aria-hidden className={iconClassName} />,
          label: '재고 관리',
        },
        ...(canShowHqMenus
          ? [item('/purchase-orders', '구매 관리', <ShoppingCart aria-hidden className={iconClassName} />)]
          : []),
        ...(salesOrderItems.length > 0
          ? [
              {
                children: salesOrderItems,
                icon: <ClipboardList aria-hidden className={iconClassName} />,
                label: '발주 관리',
              },
            ]
          : []),
      ],
    },
    {
      label: '마스터',
      items: [
        item('/items', '부품 마스터', <PackageSearch aria-hidden className={iconClassName} />),
        item('/warehouses', '창고 · 지점', <Building2 aria-hidden className={iconClassName} />),
      ],
    },
    ...(canShowUserManagement
      ? [
          {
            label: '관리',
            items: [item('/users', '사용자 목록', <Users aria-hidden className={iconClassName} />)],
          },
        ]
      : []),
  ]

  const bottomItems: FgNavItem[] = [
    item('/my-page', '마이페이지', <User aria-hidden className={iconClassName} />),
    { icon: <Settings aria-hidden className={iconClassName} />, label: '설정' },
  ]

  const profileMenuItems: FgDropdownItem[] = [
    {
      icon: <User aria-hidden className={iconClassName} />,
      label: '마이페이지',
      onSelect: () => void navigate({ to: '/my-page' }),
    },
    {
      icon: <KeyRound aria-hidden className={iconClassName} />,
      label: '비밀번호 변경',
      onSelect: () => window.location.assign(PASSWORD_CHANGE_URL),
    },
    {
      danger: true,
      icon: <LogOut aria-hidden className={iconClassName} />,
      label: '로그아웃',
      onSelect: () => {
        queryClient.clear()
        window.location.assign(LOGOUT_URL)
      },
    },
  ]

  return (
    <FgAppShell
      bottomItems={bottomItems}
      navGroups={navGroups}
      profileMenuItems={profileMenuItems}
      userName={session?.name || session?.employeeNo || ''}
      userRole={roleLabel(session?.userRole)}
    >
      <Outlet />
    </FgAppShell>
  )
}
