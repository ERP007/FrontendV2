import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'

import { AppShellLayout } from '@/app/layouts/AppShellLayout'
import { UsersPage } from '@/pages/admin/UsersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { BranchSalesOrderArrivalPage } from '@/pages/branch/BranchSalesOrderArrivalPage'
import { BranchSalesOrderCreatePage } from '@/pages/branch/BranchSalesOrderCreatePage'
import { BranchSalesOrderDetailPage } from '@/pages/branch/BranchSalesOrderDetailPage'
import { BranchSalesOrdersPage } from '@/pages/branch/BranchSalesOrdersPage'
import { ItemsRoutePage } from '@/pages/common/ItemsRoutePage'
import { MyPage } from '@/pages/common/MyPage'
import { DashboardPage } from '@/pages/hq/DashboardPage'
import { PurchaseOrderCreatePage } from '@/pages/hq/PurchaseOrderCreatePage'
import { PurchaseOrderDetailPage } from '@/pages/hq/PurchaseOrderDetailPage'
import { PurchaseOrdersPage } from '@/pages/hq/PurchaseOrdersPage'
import { SalesOrderDetailPage } from '@/pages/hq/SalesOrderDetailPage'
import { SalesOrderShipPage } from '@/pages/hq/SalesOrderShipPage'
import { SalesOrdersPage } from '@/pages/hq/SalesOrdersPage'
import { StockMovementsPage } from '@/pages/hq/StockMovementsPage'
import { StocksPage } from '@/pages/hq/StocksPage'
import { WarehousesPage } from '@/pages/hq/WarehousesPage'
import {
  isAuthRedirectInProgress,
  isErrorResponse,
  redirectToAuthLogin,
  waitForAuthRedirect,
} from '@/shared/api'
import { ensureSession } from '@/shared/auth/session'
import {
  canAccessBranchScope,
  canAccessHqScope,
  canAccessUserManagement,
} from '@/shared/config/session'

const rootRoute = createRootRoute()

function getInitialHomePath(userRole?: string | null) {
  if (canAccessUserManagement(userRole)) {
    return '/users'
  }

  if (canAccessHqScope(userRole)) {
    return '/dashboard'
  }

  return '/stocks'
}

function shouldWaitForAuthRedirect(error: unknown) {
  return isAuthRedirectInProgress() || (isErrorResponse(error) && error.status === 401)
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

const loginRoute = createRoute({
  component: LoginPage,
  getParentRoute: () => rootRoute,
  path: '/login',
})

const shellRoute = createRoute({
  beforeLoad: async () => {
    try {
      await ensureSession()
    } catch (error) {
      if (shouldWaitForAuthRedirect(error)) {
        redirectToAuthLogin({ force: true })
        return await waitForAuthRedirect()
      }

      throw error
    }
  },
  component: AppShellLayout,
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
})

const stockMovementsRoute = createRoute({
  component: StockMovementsPage,
  getParentRoute: () => shellRoute,
  path: '/stock-movements',
  // 재고 조회 상세 패널 '전체 이력 보기'에서 sku를 keyword로 넘겨받는다(선택적).
  validateSearch: (search: Record<string, unknown>): { keyword?: string } => ({
    keyword: typeof search.keyword === 'string' ? search.keyword : undefined,
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

const routeTree = rootRoute.addChildren([
  loginRoute,
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
    salesOrdersRoute,
    salesOrderDetailRoute,
    salesOrderShipRoute,
    branchSalesOrdersRoute,
    branchSalesOrderCreateRoute,
    branchSalesOrderArrivalRoute,
    branchSalesOrderDetailRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
