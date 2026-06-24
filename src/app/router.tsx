import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { AlertTriangle, RotateCw } from 'lucide-react'

import { AppShellLayout } from '@/app/layouts/AppShellLayout'
import { UsersPage } from '@/pages/admin/UsersPage'
import { BranchSalesOrderArrivalPage } from '@/pages/branch/BranchSalesOrderArrivalPage'
import { BranchSalesOrderCreatePage } from '@/pages/branch/BranchSalesOrderCreatePage'
import { BranchSalesOrderDetailPage } from '@/pages/branch/BranchSalesOrderDetailPage'
import { BranchSalesOrderEditPage } from '@/pages/branch/BranchSalesOrderEditPage'
import { BranchSalesOrdersPage } from '@/pages/branch/BranchSalesOrdersPage'
import { ItemsRoutePage } from '@/pages/common/ItemsRoutePage'
import { MyPage } from '@/pages/common/MyPage'
import { DashboardPage } from '@/pages/hq/DashboardPage'
import { PurchaseOrderCreatePage } from '@/pages/hq/PurchaseOrderCreatePage'
import { PurchaseOrderDetailPage } from '@/pages/hq/PurchaseOrderDetailPage'
import { PurchaseOrderEditPage } from '@/pages/hq/PurchaseOrderEditPage'
import { PurchaseOrdersPage } from '@/pages/hq/PurchaseOrdersPage'
import { SalesOrderDetailPage } from '@/pages/hq/SalesOrderDetailPage'
import { SalesOrderShipPage } from '@/pages/hq/SalesOrderShipPage'
import { SalesOrdersPage } from '@/pages/hq/SalesOrdersPage'
import { StockMovementsPage } from '@/pages/hq/StockMovementsPage'
import { StocksPage } from '@/pages/hq/StocksPage'
import { WarehousesPage } from '@/pages/hq/WarehousesPage'
import {
  consumeLogoutRedirectPending,
  isAuthRedirectInProgress,
  isErrorResponse,
  redirectToAuthLogin,
  redirectToForcedAuthLogin,
  waitForAuthRedirect,
} from '@/shared/api'
import { ensureSession, isAuthSessionCookieError } from '@/shared/auth/session'
import {
  canAccessBranchScope,
  canAccessHqScope,
  canAccessUserManagement,
} from '@/shared/config/session'
import { FgButton, FgNotice } from '@/shared/ui'

const rootRoute = createRootRoute()

function AuthSessionCookieErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <section className="w-full max-w-[560px] space-y-6 rounded-card border border-line bg-surface p-8 shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-control bg-danger-bg text-danger">
          <AlertTriangle aria-hidden className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-title font-bold text-ink">세션 쿠키를 확인하지 못했습니다.</h1>
          <p className="text-body text-muted">
            로그인을 완료했지만 브라우저가 서비스 세션 쿠키를 저장하거나 API 요청에 전송하지 못했습니다.
          </p>
        </div>
        <FgNotice tone="warning">
          시크릿 모드의 쿠키 차단 설정을 확인하거나, 로컬 개발 환경에서는 API 요청을 /api 프록시로 보내주세요.
        </FgNotice>
        <div className="flex justify-end">
          <FgButton leftIcon={<RotateCw aria-hidden className="h-4 w-4" />} onClick={() => redirectToAuthLogin()}>
            다시 로그인
          </FgButton>
        </div>
      </section>
    </main>
  )
}

function ShellErrorComponent({ error }: { error: unknown }) {
  if (isAuthSessionCookieError(error)) {
    return <AuthSessionCookieErrorPage />
  }

  throw error
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

function isUnauthorizedError(error: unknown) {
  return isErrorResponse(error) && error.status === 401
}

function createRoleGuard(canAccess: (role?: string | null) => boolean) {
  return async () => {
    const session = await ensureSession()

    if (!canAccess(session.userRole)) {
      throw redirect({ to: getInitialHomePath(session.userRole) })
    }
  }
}

const requireUserManagementAccess = createRoleGuard(canAccessUserManagement)
const requireHqScopeAccess = createRoleGuard(canAccessHqScope)
const requireBranchScopeAccess = createRoleGuard(canAccessBranchScope)

const loginRedirectRoute = createRoute({
  beforeLoad: async () => {
    redirectToAuthLogin()
    return await waitForAuthRedirect()
  },
  getParentRoute: () => rootRoute,
  path: '/login',
})

const shellRoute = createRoute({
  beforeLoad: async () => {
    const logoutRedirectTarget = consumeLogoutRedirectPending()

    if (logoutRedirectTarget === 'forced-login') {
      redirectToForcedAuthLogin()
      return await waitForAuthRedirect()
    }

    if (logoutRedirectTarget === 'login') {
      redirectToAuthLogin()
      return await waitForAuthRedirect()
    }

    try {
      await ensureSession()
    } catch (error) {
      if (isAuthRedirectInProgress()) {
        return await waitForAuthRedirect()
      }

      if (isAuthSessionCookieError(error)) {
        throw error
      }

      if (isUnauthorizedError(error)) {
        redirectToAuthLogin()
        return await waitForAuthRedirect()
      }

      throw error
    }
  },
  component: AppShellLayout,
  errorComponent: ShellErrorComponent,
  getParentRoute: () => rootRoute,
  id: 'shell',
})

const indexRoute = createRoute({
  beforeLoad: async () => {
    const session = await ensureSession()

    throw redirect({ to: getInitialHomePath(session.userRole) })
  },
  getParentRoute: () => shellRoute,
  path: '/',
})

const dashboardRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: DashboardPage,
  getParentRoute: () => shellRoute,
  path: '/dashboard',
})

const stocksRoute = createRoute({
  component: StocksPage,
  getParentRoute: () => shellRoute,
  path: '/stocks',
  // 대시보드 KPI '총 SKU'(전체)·'부족 재고'(LOW) 카드 클릭 시 초기 재고 상태 필터를 넘겨받는다(선택적).
  validateSearch: (search: Record<string, unknown>): { status?: 'ALL' | 'LOW' | 'NORMAL' } => ({
    status:
      search.status === 'ALL' || search.status === 'LOW' || search.status === 'NORMAL'
        ? search.status
        : undefined,
  }),
})

const stockMovementsRoute = createRoute({
  component: StockMovementsPage,
  getParentRoute: () => shellRoute,
  path: '/stock-movements',
  // 재고 조회 상세 패널 '전체 이력 보기'의 sku(keyword), KPI '최근 7일 이동'의 기간(from/to)을 넘겨받는다(모두 선택적).
  validateSearch: (
    search: Record<string, unknown>,
  ): { from?: string; keyword?: string; to?: string } => ({
    from: typeof search.from === 'string' ? search.from : undefined,
    keyword: typeof search.keyword === 'string' ? search.keyword : undefined,
    to: typeof search.to === 'string' ? search.to : undefined,
  }),
})

const itemsRoute = createRoute({
  component: ItemsRoutePage,
  getParentRoute: () => shellRoute,
  path: '/items',
})

const warehousesRoute = createRoute({
  component: WarehousesPage,
  getParentRoute: () => shellRoute,
  path: '/warehouses',
})

const usersRoute = createRoute({
  beforeLoad: requireUserManagementAccess,
  component: UsersPage,
  getParentRoute: () => shellRoute,
  path: '/users',
})

const myPageRoute = createRoute({
  component: MyPage,
  getParentRoute: () => shellRoute,
  path: '/my-page',
})

const myPageLegacyRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ to: '/my-page' })
  },
  getParentRoute: () => shellRoute,
  path: '/mypage',
})

const purchaseOrdersRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: PurchaseOrdersPage,
  getParentRoute: () => shellRoute,
  path: '/purchase-orders',
})

const purchaseOrderCreateRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: PurchaseOrderCreatePage,
  getParentRoute: () => shellRoute,
  path: '/purchase-orders/new',
})

const purchaseOrderDetailRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: PurchaseOrderDetailPage,
  getParentRoute: () => shellRoute,
  path: '/purchase-orders/$poNo',
})

const purchaseOrderEditRoute = createRoute({
  component: PurchaseOrderEditPage,
  getParentRoute: () => shellRoute,
  path: '/purchase-orders/$poNo/edit',
})

const salesOrdersRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: SalesOrdersPage,
  getParentRoute: () => shellRoute,
  path: '/sales-orders',
})

const salesOrderDetailRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: SalesOrderDetailPage,
  getParentRoute: () => shellRoute,
  path: '/sales-orders/$soNo',
})

const salesOrderShipRoute = createRoute({
  beforeLoad: requireHqScopeAccess,
  component: SalesOrderShipPage,
  getParentRoute: () => shellRoute,
  path: '/sales-orders/$soNo/ship',
})

const branchSalesOrdersRoute = createRoute({
  beforeLoad: requireBranchScopeAccess,
  component: BranchSalesOrdersPage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders',
})

const branchSalesOrderCreateRoute = createRoute({
  beforeLoad: requireBranchScopeAccess,
  component: BranchSalesOrderCreatePage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders/new',
})

const branchSalesOrderArrivalRoute = createRoute({
  beforeLoad: requireBranchScopeAccess,
  component: BranchSalesOrderArrivalPage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders/$soNo/arrival',
})

const branchSalesOrderDetailRoute = createRoute({
  beforeLoad: requireBranchScopeAccess,
  component: BranchSalesOrderDetailPage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders/$soNo',
})

const branchSalesOrderEditRoute = createRoute({
  component: BranchSalesOrderEditPage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders/$soNo/edit',
})

const routeTree = rootRoute.addChildren([
  loginRedirectRoute,
  shellRoute.addChildren([
    indexRoute,
    dashboardRoute,
    stocksRoute,
    stockMovementsRoute,
    itemsRoute,
    warehousesRoute,
    usersRoute,
    myPageRoute,
    myPageLegacyRoute,
    purchaseOrdersRoute,
    purchaseOrderCreateRoute,
    purchaseOrderDetailRoute,
    purchaseOrderEditRoute,
    salesOrdersRoute,
    salesOrderDetailRoute,
    salesOrderShipRoute,
    branchSalesOrdersRoute,
    branchSalesOrderCreateRoute,
    branchSalesOrderArrivalRoute,
    branchSalesOrderDetailRoute,
    branchSalesOrderEditRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
