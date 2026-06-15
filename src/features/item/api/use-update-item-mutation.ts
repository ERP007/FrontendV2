import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import { ITEM_UNIT_OPTIONS } from '../model/types'

import type { ItemDetail, ItemDetailFormValues, ItemUnit, UpdateItemRequest } from '../model/types'

interface UpdateItemVariables {
  sku: string
  values: ItemDetailFormValues
}

interface ItemDetailApiResponse {
  active: boolean
  categoryCode: string
  categoryName: string
  createdAt: string
  name: string
  safetyStock: number
  sku: string
  subCategoryCode: string
  subCategoryName: string
  unit: string
  unitPrice: number
  updatedAt: string
}

const updateItemFallbackMessages: Record<string, string> = {
  'ITM-001': '요청이 유효하지 않습니다.',
  'ITM-010': '단위가 올바르지 않습니다.',
  'ITM-011': '안전재고가 올바르지 않습니다.',
  'ITM-012': '기준 단가가 올바르지 않습니다.',
  'ITM-014': '부품명이 올바르지 않습니다.',
  'ITM-015': '대분류가 올바르지 않습니다.',
  'ITM-016': '중분류가 올바르지 않습니다.',
  'ITM-018': '비활성 부품은 수정할 수 없습니다.',
  'ITM-019': '부품을 찾을 수 없습니다.',
  'ITM-020': '다른 사용자가 먼저 수정했습니다.',
}

function toItemUnit(unit: string): ItemUnit {
  return ITEM_UNIT_OPTIONS.includes(unit as ItemUnit) ? (unit as ItemUnit) : 'EA'
}

function toItemDetail(response: ItemDetailApiResponse): ItemDetail {
  return {
    active: response.active,
    categoryCode: response.categoryCode,
    categoryName: response.categoryName,
    createdAt: response.createdAt,
    name: response.name,
    safetyStock: response.safetyStock,
    sku: response.sku,
    subCategoryCode: response.subCategoryCode,
    subCategoryName: response.subCategoryName,
    unit: toItemUnit(response.unit),
    unitPrice: response.unitPrice,
    updatedAt: response.updatedAt,
  }
}

function toUpdateItemRequest(values: ItemDetailFormValues): UpdateItemRequest {
  return {
    categoryCode: values.categoryCode,
    name: values.name.trim(),
    safetyStock: values.safetyStock,
    subCategoryCode: values.subCategoryCode,
    unit: values.unit,
    unitPrice: values.unitPrice,
  }
}

export function getUpdateItemErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()

    return detail || updateItemFallbackMessages[error.errorCode] || '부품 수정 중 오류가 발생했습니다.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '부품 수정 중 오류가 발생했습니다.'
}

export function useUpdateItemMutation() {
  return useMutation({
    mutationFn: async ({ sku, values }: UpdateItemVariables) => {
      const response = await api.patch<ItemDetailApiResponse>(
        `/items/${encodeURIComponent(sku)}`,
        toUpdateItemRequest(values),
      )

      return toItemDetail(response.data)
    },
  })
}
