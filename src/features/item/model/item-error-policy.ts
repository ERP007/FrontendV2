import { isErrorResponse } from '@/shared/api'

import type { ItemErrorCode } from '@/shared/api'

const itemFallbackMessages: Partial<Record<ItemErrorCode, string>> = {
  'ITM-001': '요청이 유효하지 않습니다.',
  'ITM-002': '카테고리 코드 형식이 올바르지 않습니다.',
  'ITM-003': '카테고리를 찾을 수 없습니다.',
  'ITM-004': '부품 코드를 입력하세요.',
  'ITM-006': '부품 코드 형식이 올바르지 않습니다.',
  'ITM-008': '부품명을 입력하세요.',
  'ITM-009': '카테고리를 선택하세요.',
  'ITM-010': '단위가 올바르지 않습니다.',
  'ITM-011': '안전재고가 올바르지 않습니다.',
  'ITM-012': '기준 단가가 올바르지 않습니다.',
  'ITM-013': '이미 존재하는 SKU입니다.',
  'ITM-014': '부품명이 올바르지 않습니다.',
  'ITM-015': '대분류가 올바르지 않습니다.',
  'ITM-016': '중분류가 올바르지 않습니다.',
  'ITM-017': '부품 상태가 올바르지 않습니다.',
  'ITM-018': '비활성 부품은 수정할 수 없습니다.',
  'ITM-019': '부품을 찾을 수 없습니다.',
  'ITM-020': '다른 사용자가 먼저 수정했습니다.',
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()
    const fallback = itemFallbackMessages[error.errorCode as ItemErrorCode]

    return detail || fallback || fallbackMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

export function getCreateItemErrorMessage(error: unknown) {
  return getErrorMessage(error, '부품 등록 중 오류가 발생했습니다.')
}

export function getItemSkuCheckErrorMessage(error: unknown) {
  return getErrorMessage(error, '부품 코드 중복 확인 중 오류가 발생했습니다.')
}

export function getItemDetailErrorMessage(error: unknown) {
  return getErrorMessage(error, '부품 상세 조회 중 오류가 발생했습니다.')
}

export function getUpdateItemErrorMessage(error: unknown) {
  return getErrorMessage(error, '부품 수정 중 오류가 발생했습니다.')
}

export function getItemStatusChangeErrorMessage(error: unknown) {
  return getErrorMessage(error, '부품 상태 변경 중 오류가 발생했습니다.')
}

export function isItemNotFoundError(error: unknown) {
  return isErrorResponse(error) && (error.status === 404 || error.errorCode === 'ITM-019')
}

export function isLocalItemFormError(error: unknown) {
  return isErrorResponse(error) && (error.status === 400 || error.status === 409)
}
