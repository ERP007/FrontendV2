import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { salesOrderKeys } from '../model/so-query-keys'
import type { SalesOrderProgressResponse } from '../model/types'

const POLL_INTERVAL_MS = 1000

/**
 * SO #10 진행 상태 조회(폴링) — GET /sales-orders/{code}/progress.
 * 승인(#6)/입고(#9) 호출 후 `enabled` 를 켜면 pending 동안 자동 폴링한다.
 * `pending === false` 면 폴링을 멈추고 outcome(SUCCESS/FAILED) 으로 분기한다.
 */
export function useSalesOrderProgressQuery(code: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && Boolean(code),
    queryFn: async () => {
      const response = await api.get<SalesOrderProgressResponse>(`/sales-orders/${code}/progress`)
      return response.data
    },
    queryKey: salesOrderKeys.progress(code),
    refetchInterval: (query) =>
      query.state.data?.pending === false ? false : POLL_INTERVAL_MS,
  })
}
