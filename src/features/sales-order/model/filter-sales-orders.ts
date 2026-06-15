import dayjs from 'dayjs'

import { IN_PROGRESS_STATUSES, isSoDelayed } from './types'

import type { SalesOrder, SalesOrderFilter, SoStatusTab } from './types'

export function createDefaultSoFilter(): SalesOrderFilter {
  return {
    branchCode: 'ALL',
    endDate: dayjs().format('YYYY-MM-DD'),
    search: '',
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    status: 'ALL',
  }
}

export function filterSalesOrders(orders: SalesOrder[], filter: SalesOrderFilter): SalesOrder[] {
  const search = filter.search.trim().toLowerCase()

  return orders
    .filter((order) => {
      if (search) {
        const matches =
          order.reqNo.toLowerCase().includes(search) ||
          order.branchName.toLowerCase().includes(search) ||
          order.lines.some(
            (line) =>
              line.itemName.toLowerCase().includes(search) ||
              line.sku.toLowerCase().includes(search),
          )
        if (!matches) return false
      }

      if (filter.status !== 'ALL' && order.status !== filter.status) return false
      if (filter.branchCode !== 'ALL' && order.branchCode !== filter.branchCode) return false

      const requestedDate = order.requestedAt.slice(0, 10)
      if (filter.startDate && requestedDate < filter.startDate) return false
      if (filter.endDate && requestedDate > filter.endDate) return false

      return true
    })
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}

export function applyStatusTab(orders: SalesOrder[], tab: SoStatusTab): SalesOrder[] {
  switch (tab) {
    case 'IN_PROGRESS':
      return orders.filter((order) => IN_PROGRESS_STATUSES.includes(order.status))
    case 'DONE':
      return orders.filter((order) => order.status === 'DELIVERED')
    case 'CLOSED':
      return orders.filter((order) => order.status === 'REJECTED' || order.status === 'CANCELED')
    default:
      return orders
  }
}

export interface SoHqKpi {
  delayedCount: number
  pendingApprovalCount: number
  pendingShipCount: number
  totalCount: number
}

export function deriveSoHqKpi(orders: SalesOrder[]): SoHqKpi {
  const today = dayjs().format('YYYY-MM-DD')

  return {
    delayedCount: orders.filter((order) => isSoDelayed(order, today)).length,
    pendingApprovalCount: orders.filter((order) => order.status === 'REQUESTED').length,
    pendingShipCount: orders.filter((order) => order.status === 'APPROVED').length,
    totalCount: orders.length,
  }
}

export interface SoBranchKpi {
  approvedCount: number
  draftCount: number
  requestedCount: number
  totalCount: number
}
