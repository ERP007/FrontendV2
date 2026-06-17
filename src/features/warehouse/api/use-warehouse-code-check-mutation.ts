import { useMutation } from '@tanstack/react-query'

import { api } from '@/shared/api'

import type { WarehouseCodeCheckResult } from '../model/types'

/**
 * 창고 코드 중복 확인 (GET /inventory/warehouses/code-check). ADMIN·HQ_MANAGER 전용.
 * 등록 모달의 "중복 확인" 버튼에서 호출하며 available=true 수신 전까지 등록을 막는다.
 */
export function useWarehouseCodeCheckMutation() {
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await api.get<WarehouseCodeCheckResult>('/inventory/warehouses/code-check', {
        params: { code: code.trim() },
      })

      return response.data
    },
  })
}
