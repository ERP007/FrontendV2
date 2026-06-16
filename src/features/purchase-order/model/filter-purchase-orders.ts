import dayjs from 'dayjs'

import type { PurchaseOrder, PurchaseOrderFilter } from './ui-mock-types'

export function createDefaultPoFilter(): PurchaseOrderFilter {
  return {
    from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    keyword: '',
    status: 'ALL',
    supplierCode: 'ALL',
    to: dayjs().format('YYYY-MM-DD'),
  }
}

export function filterPurchaseOrders(
  orders: PurchaseOrder[],
  filter: PurchaseOrderFilter,
): PurchaseOrder[] {
  const keyword = filter.keyword.trim().toLowerCase()

  return orders
    .filter((order) => {
      if (keyword) {
        const matches =
          order.poNo.toLowerCase().includes(keyword) ||
          order.supplierName.toLowerCase().includes(keyword)
        if (!matches) return false
      }

      if (filter.status !== 'ALL' && order.status !== filter.status) return false
      if (filter.supplierCode !== 'ALL' && order.supplierCode !== filter.supplierCode) return false
      if (filter.from && order.createdAt < filter.from) return false
      if (filter.to && order.createdAt > filter.to) return false

      return true
    })
    .sort((a, b) => {
      // 도착 예정일 오름차순(미정은 뒤로), 같으면 최근 등록 순
      if (a.expectedAt && b.expectedAt && a.expectedAt !== b.expectedAt) {
        return a.expectedAt.localeCompare(b.expectedAt)
      }
      if (a.expectedAt && !b.expectedAt) return -1
      if (!a.expectedAt && b.expectedAt) return 1
      return b.createdAt.localeCompare(a.createdAt)
    })
}

