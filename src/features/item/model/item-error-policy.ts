import { isErrorResponse } from '@/shared/api'

import type { ItemErrorCode } from '@/shared/api'

function isAxiosDefaultMessage(message: string) {
  return /^Request failed with status code \d+$/.test(message)
}

export function getItemErrorDetail(error: unknown, fallbackMessage: string) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()

    return detail && !isAxiosDefaultMessage(detail) ? detail : fallbackMessage
  }

  if (error instanceof Error && error.message && !isAxiosDefaultMessage(error.message)) {
    return error.message
  }

  return fallbackMessage
}

export function getItemStockErrorDetail(error: unknown) {
  if (isErrorResponse(error) && error.status === 403) {
    return getItemErrorDetail(error, '재고 조회 권한이 없습니다.')
  }

  return getItemErrorDetail(error, '재고 조회 중 오류가 발생했습니다.')
}

export function isItemErrorCode(error: unknown, errorCode: ItemErrorCode) {
  return isErrorResponse(error) && error.errorCode === errorCode
}
