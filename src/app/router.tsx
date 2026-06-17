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
import { PurchaseOrderEditPage } from '@/pages/hq/PurchaseOrderEditPage'
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

const rootRoute = createRootRoute()

function getInitialHomePath(userRole?: string | null) {
  return userRole === 'ADMIN' ? '/users' : '/dashboard'
}

function shouldWaitForAuthRedirect(error: unknown) {
  return isAuthRedirectInProgress() || (isErrorResponse(error) && error.status === 401)
}

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
  component: PurchaseOrdersPage,
  getParentRoute: () => shellRoute,
  path: '/purchase-orders',
})

const purchaseOrderCreateRoute = createRoute({
  component: PurchaseOrderCreatePage,
  getParentRoute: () => shellRoute,
  path: '/purchase-orders/new',
})

const purchaseOrderDetailRoute = createRoute({
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
  component: SalesOrdersPage,
  getParentRoute: () => shellRoute,
  path: '/sales-orders',
})

const salesOrderDetailRoute = createRoute({
  component: SalesOrderDetailPage,
  getParentRoute: () => shellRoute,
  path: '/sales-orders/$soNo',
})

const salesOrderShipRoute = createRoute({
  component: SalesOrderShipPage,
  getParentRoute: () => shellRoute,
  path: '/sales-orders/$soNo/ship',
})

const branchSalesOrdersRoute = createRoute({
  component: BranchSalesOrdersPage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders',
})

const branchSalesOrderCreateRoute = createRoute({
  component: BranchSalesOrderCreatePage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders/new',
})

const branchSalesOrderArrivalRoute = createRoute({
  component: BranchSalesOrderArrivalPage,
  getParentRoute: () => shellRoute,
  path: '/branch/sales-orders/$soNo/arrival',
})

const branchSalesOrderDetailRoute = createRoute({
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
    purchaseOrderEditRoute,
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
