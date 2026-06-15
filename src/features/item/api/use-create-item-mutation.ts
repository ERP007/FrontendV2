import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { CreateItemRequest, CreateItemResponse, ItemFormValues } from '../model/types'

function toCreateItemRequest(values: ItemFormValues): CreateItemRequest {
  return {
    categoryCode: values.categoryCode,
    name: values.name.trim(),
    safetyStock: values.safetyStock,
    sku: values.sku.trim(),
    unit: values.unit,
    unitPrice: values.unitPrice,
  }
}

export function getCreateItemErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()

    if (error.status === 409 || error.errorCode === 'DUPLICATE_SKU') {
      return '이미 사용 중인 SKU입니다. 중복 확인 후 다시 시도해주세요.'
    }

    if (error.errorCode === 'INVALID_SKU_FORMAT') {
      return '부품 코드 형식이 올바르지 않습니다.\n예: HMC-EN-00214'
    }

    if (error.errorCode === 'SKU_REQUIRED') {
      return '부품 코드를 입력하세요.'
    }

    if (error.errorCode === 'ITEM_NAME_REQUIRED') {
      return '부품명을 입력하세요.'
    }

    if (error.errorCode === 'CATEGORY_REQUIRED' || error.errorCode === 'CATEGORY_NOT_FOUND') {
      return '분류를 다시 선택해주세요.'
    }

    if (error.errorCode === 'INVALID_UNIT') {
      return '단위를 다시 선택해주세요.'
    }

    if (error.errorCode === 'INVALID_SAFETY_STOCK') {
      return '안전재고는 0 이상 정수로 입력해주세요.'
    }

    if (error.errorCode === 'INVALID_UNIT_PRICE') {
      return '단가는 0 이상 정수로 입력해주세요.'
    }

    if (error.status === 403) {
      return '부품 등록 권한이 없습니다.'
    }

    if (error.status >= 500) {
      return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
    }

    return detail || '부품 등록 중 오류가 발생했습니다.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '부품 등록 중 오류가 발생했습니다.'
}

export function useCreateItemMutation() {
  return useMutation({
    mutationFn: async (values: ItemFormValues) => {
      const response = await api.post<CreateItemResponse>('/items', toCreateItemRequest(values))

      return response.data
    },
  })
}
