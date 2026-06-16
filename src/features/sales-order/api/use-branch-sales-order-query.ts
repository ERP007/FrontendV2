import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { CarrierType, SalesOrderStatus } from '../model/types'

export interface BranchSalesOrderWarehouseRef {
  code: string
  name: string
}

export interface BranchSalesOrderDetailLine {
  id: number
  itemCode: string
  itemName: string
  requestQuantity: number
  unit: string
}

export interface BranchSalesOrderDetail {
  approvedAt: string | null
  carrierType: CarrierType | null
  code: string
  fromWarehouse: BranchSalesOrderWarehouseRef
  invoiceNumber: string | null
  lines: BranchSalesOrderDetailLine[]
  status: SalesOrderStatus
  toWarehouse: BranchSalesOrderWarehouseRef
}

const branchSalesOrderQueryKey = (code: string) =>
  ['sales-orders', 'branch', 'detail', code] as const

export function useBranchSalesOrderQuery(code: string | undefined) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<BranchSalesOrderDetail>(`/sales-orders/branch/${code}`)
      return response.data
    },
    queryKey: branchSalesOrderQueryKey(code ?? ''),
  })
}
