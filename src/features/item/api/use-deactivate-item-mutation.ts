import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

interface ItemStatusChangeResponse {
  active: boolean
  name: string
  sku: string
  updatedAt: string
}

const itemStatusChangeFallbackMessages: Record<string, string> = {
  'ITM-017': '부품 상태가 올바르지 않습니다.',
  'ITM-019': '부품을 찾을 수 없습니다.',
  'ITM-020': '다른 사용자가 먼저 수정했습니다.',
}

export function getItemStatusChangeErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()

    return detail || itemStatusChangeFallbackMessages[error.errorCode] || '부품 상태 변경 중 오류가 발생했습니다.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '부품 상태 변경 중 오류가 발생했습니다.'
}

export function useDeactivateItemMutation() {
  return useMutation({
    mutationFn: async (sku: string) => {
      const response = await api.patch<ItemStatusChangeResponse>(
        `/items/${encodeURIComponent(sku)}/deactivate`,
      )

      return response.data
    },
  })
}
