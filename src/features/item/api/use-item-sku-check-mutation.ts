import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ItemSkuCheckResult } from '../model/types'

function toSkuCheckRequest(sku: string) {
  return {
    sku: sku.trim(),
  }
}

export function getItemSkuCheckErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()

    switch (error.errorCode) {
      case 'ITM-004':
        return '부품 코드를 입력하세요.'
      case 'ITM-006':
        return '부품 코드 형식이 올바르지 않습니다.\n예: HMC-EN-00214'
    }

    if (error.status === 403) {
      return '부품 코드 중복 확인 권한이 없습니다.'
    }

    if (error.status >= 500) {
      return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
    }

    return detail || '부품 코드 중복 확인 중 오류가 발생했습니다.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '부품 코드 중복 확인 중 오류가 발생했습니다.'
}

export function useItemSkuCheckMutation() {
  return useMutation({
    mutationFn: async (sku: string) => {
      const response = await api.post<ItemSkuCheckResult>('/items/code-check', toSkuCheckRequest(sku))

      return response.data
    },
  })
}
