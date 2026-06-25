import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Boxes,
  Building2,
  Check,
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
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import {
  isErrorResponse,
  logoutAndRedirectToLogin,
  PASSWORD_CHANGE_URL,
  queryClient,
  redirectToAuthLogin,
} from '@/shared/api'
import {
  ensureSession,
  getSwitchDemoAccountErrorMessage,
  switchDemoAccount,
  useSession,
} from '@/shared/auth/session'
import {
  canAccessBranchScope,
  canAccessHqScope,
  canAccessUserManagement,
  roleLabel,
} from '@/shared/config/session'
import { FgAppShell } from '@/shared/ui'
import type { FgDropdownItem, FgNavGroup, FgNavItem } from '@/shared/ui'

const iconClassName = 'h-4.5 w-4.5'

const demoAccounts = [
  { description: '관리자 계정', employeeNo: 'ADMIN', label: 'ADMIN' },
  { description: '본사 계정', employeeNo: 'HQ001', label: 'HQ001' },
  { description: '지점 계정', employeeNo: 'BR001', label: 'BR001' },
] as const

function AccountSwitchLabel({
  label,
  description,
}: {
  label: string
  description: string
}) {
  return (
    <span className="min-w-44">
      <span>
        <strong className="block text-label font-extrabold">{label}</strong>
        <span className="block text-micro font-medium text-faint">{description}</span>
      </span>
    </span>
  )
}

function getInitialHomePath(userRole?: string | null) {
  if (canAccessUserManagement(userRole)) {
    return '/users'
  }

  if (canAccessHqScope(userRole)) {
    return '/dashboard'
  }

  return '/stocks'
}

export function AppShellLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { data: session } = useSession()
  const switchingAccountRef = useRef(false)
  const [switchingEmployeeNo, setSwitchingEmployeeNo] = useState<string | null>(null)
  const userRole = session?.userRole
  const canShowUserManagement = canAccessUserManagement(userRole)
  const canShowHqMenus = canAccessHqScope(userRole)
  const canShowBranchMenus = canAccessBranchScope(userRole)

  const handleSwitchAccount = async (account: (typeof demoAccounts)[number]) => {
    if (switchingAccountRef.current) {
      return
    }

    const isCurrentAccount =
      account.employeeNo === session?.employeeNo || account.employeeNo === session?.tenancyCode

    if (isCurrentAccount) {
      toast.info('이미 선택된 계정입니다.')
      return
    }

    switchingAccountRef.current = true
    setSwitchingEmployeeNo(account.employeeNo)

    try {
      await switchDemoAccount(account.employeeNo)
      queryClient.clear()

      const nextSession = await ensureSession()
      const nextPath = getInitialHomePath(nextSession.userRole)

      toast.success(`${account.label} 계정으로 전환되었습니다.`)
      await navigate({ replace: true, to: nextPath })
    } catch (error) {
      const message = getSwitchDemoAccountErrorMessage(error)

      toast.error(message)

      if (isErrorResponse(error) && error.status === 401) {
        redirectToAuthLogin()
      }
    } finally {
      switchingAccountRef.current = false
      setSwitchingEmployeeNo(null)
    }
  }

  const item = (to: string, label: string, icon?: ReactNode): FgNavItem => ({
    active: pathname === to || pathname.startsWith(`${to}/`),
    icon,
    label,
    onClick: () => void navigate({ to }),
  })

  const salesOrderItems = [
    ...(canShowHqMenus
      ? [item('/sales-orders', '발주 현황', <ClipboardCheck aria-hidden className={iconClassName} />)]
      : []),
    ...(canShowBranchMenus
      ? [
          {
            // '발주 요청'(신규 등록) 경로와 겹치지 않게 현황 탭 active 를 직접 계산한다.
            ...item('/branch/sales-orders', '발주 현황', <Store aria-hidden className={iconClassName} />),
            active:
              (pathname === '/branch/sales-orders' ||
                pathname.startsWith('/branch/sales-orders/')) &&
              !pathname.startsWith('/branch/sales-orders/new'),
          },
          item(
            '/branch/sales-orders/new',
            '발주 요청',
            <ClipboardCheck aria-hidden className={iconClassName} />,
          ),
        ]
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
          ? [
              {
                children: [
                  {
                    // '구매 주문'(신규 등록) 경로와 겹치지 않게 현황 탭 active 를 직접 계산한다.
                    ...item(
                      '/purchase-orders',
                      '구매 현황',
                      <ClipboardCheck aria-hidden className={iconClassName} />,
                    ),
                    active:
                      (pathname === '/purchase-orders' ||
                        pathname.startsWith('/purchase-orders/')) &&
                      !pathname.startsWith('/purchase-orders/new'),
                  },
                  item(
                    '/purchase-orders/new',
                    '구매 주문',
                    <ShoppingCart aria-hidden className={iconClassName} />,
                  ),
                ],
                icon: <ShoppingCart aria-hidden className={iconClassName} />,
                label: '구매 관리',
              },
            ]
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
      icon: <User aria-hidden className={iconClassName} />,
      label: '계정 전환',
      separatorBefore: true,
      subItems: demoAccounts.map((account) => {
        const active =
          account.employeeNo === session?.tenancyCode || account.employeeNo === session?.employeeNo

        return {
          ariaDisabled: switchingEmployeeNo !== null || active,
          icon: active ? <Check aria-hidden className={iconClassName} /> : <User aria-hidden className={iconClassName} />,
          label: (
            <AccountSwitchLabel
              description={switchingEmployeeNo === account.employeeNo ? '전환 중' : account.description}
              label={account.label}
            />
          ),
          onSelect: () => {
            void handleSwitchAccount(account)
          },
        } satisfies FgDropdownItem
      }),
    },
    {
      danger: true,
      icon: <LogOut aria-hidden className={iconClassName} />,
      label: '로그아웃',
      onSelect: logoutAndRedirectToLogin,
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
