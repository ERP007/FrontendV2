import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { SalesOrderStatus } from '../model/types'

export interface SalesOrderHistoryActor {
  code: string
  name: string
  position: string
}

export interface SalesOrderHistoryEntry {
  changedAt: string
  changedBy: SalesOrderHistoryActor
  status: SalesOrderStatus
}

const salesOrderHistoriesQueryKey = (code: string) =>
  ['sales-orders', code, 'histories'] as const

export function useSalesOrderHistoriesQuery(code: string) {
  return useQuery({
    queryFn: async () => {
      const response = await api.get<SalesOrderHistoryEntry[]>(
        `/sales-orders/${code}/histories`,
      )
      return response.data
    },
    queryKey: salesOrderHistoriesQueryKey(code),
  })
}
