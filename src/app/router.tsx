import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'

import { AppShellLayout } from '@/app/layouts/AppShellLayout'
import { UsersPage } from '@/pages/admin/UsersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { PasswordChangePage } from '@/pages/auth/PasswordChangePage'
import { BranchSalesOrderArrivalPage } from '@/pages/branch/BranchSalesOrderArrivalPage'
import { BranchSalesOrderCreatePage } from '@/pages/branch/BranchSalesOrderCreatePage'
import { BranchSalesOrdersPage } from '@/pages/branch/BranchSalesOrdersPage'
import { MyPage } from '@/pages/common/MyPage'
import { DashboardPage } from '@/pages/hq/DashboardPage'
import { ItemsPage } from '@/pages/hq/ItemsPage'
import { PurchaseOrderCreatePage } from '@/pages/hq/PurchaseOrderCreatePage'
import { PurchaseOrderDetailPage } from '@/pages/hq/PurchaseOrderDetailPage'
import { PurchaseOrdersPage } from '@/pages/hq/PurchaseOrdersPage'
import { SalesOrderDetailPage } from '@/pages/hq/SalesOrderDetailPage'
import { SalesOrderShipPage } from '@/pages/hq/SalesOrderShipPage'
import { SalesOrdersPage } from '@/pages/hq/SalesOrdersPage'
import { StockMovementsPage } from '@/pages/hq/StockMovementsPage'
import { StocksPage } from '@/pages/hq/StocksPage'
import { WarehousesPage } from '@/pages/hq/WarehousesPage'
import { ensureSession } from '@/shared/auth/session'

const rootRoute = createRootRoute()

const loginRoute = createRoute({
  component: LoginPage,
  getParentRoute: () => rootRoute,
  path: '/login',
})

const passwordChangeRoute = createRoute({
  component: PasswordChangePage,
  getParentRoute: () => rootRoute,
  path: '/password-change',
})

const shellRoute = createRoute({
  beforeLoad: async () => {
    await ensureSession()
  },
  component: AppShellLayout,
  getParentRoute: () => rootRoute,
  id: 'shell',
})

const indexRoute = createRoute({
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' })
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
})

const itemsRoute = createRoute({
  component: ItemsPage,
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

const routeTree = rootRoute.addChildren([
  loginRoute,
  passwordChangeRoute,
  shellRoute.addChildren([
    indexRoute,
    dashboardRoute,
    stocksRoute,
    stockMovementsRoute,
    itemsRoute,
    warehousesRoute,
    usersRoute,
    myPageRoute,
    purchaseOrdersRoute,
    purchaseOrderCreateRoute,
    purchaseOrderDetailRoute,
    salesOrdersRoute,
    salesOrderDetailRoute,
    salesOrderShipRoute,
    branchSalesOrdersRoute,
    branchSalesOrderCreateRoute,
    branchSalesOrderArrivalRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
