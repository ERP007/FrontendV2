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

export function isItemErrorCode(error: unknown, errorCode: ItemErrorCode) {
  return isErrorResponse(error) && error.errorCode === errorCode
}
