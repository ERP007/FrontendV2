import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { purchaseOrderKeys } from '../model/po-query-keys'
import type { PurchaseOrderProgressResponse } from '../model/types'

const POLL_INTERVAL_MS = 1500

/**
 * 진행 상태 조회(폴링) — GET /procurement-orders/{code}/progress.
 * 입고(#11) 호출 후 `enabled` 를 켜면 pending 동안 자동 폴링한다.
 * `pending === false` 면 폴링을 멈추고 outcome(SUCCESS/FAILED) 으로 분기한다.
 * 요청이 에러 상태면 폴링을 멈춰 무한 재요청을 막는다(소비처가 isError 로 실패 처리).
 */
export function usePurchaseOrderProgressQuery(code: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderProgressResponse>(
        `/procurement-orders/${code}/progress`,
      )
      return response.data
    },
    queryKey: purchaseOrderKeys.progress(code),
    refetchInterval: (query) => {
      if (query.state.status === 'error') return false
      return query.state.data?.pending === false ? false : POLL_INTERVAL_MS
    },
  })
}
