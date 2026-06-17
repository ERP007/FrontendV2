import { isErrorResponse } from '@/shared/api'

function isAxiosDefaultMessage(message: string) {
  return /^Request failed with status code \d+$/.test(message)
}

/** 서버 ProblemDetail.detail을 우선 노출하고, 없거나 axios 기본 메시지면 fallback을 쓴다. */
export function getWarehouseErrorDetail(error: unknown, fallbackMessage: string) {
  if (isErrorResponse(error)) {
    const detail = error.detail.trim()

    return detail && !isAxiosDefaultMessage(detail) ? detail : fallbackMessage
  }

  if (error instanceof Error && error.message && !isAxiosDefaultMessage(error.message)) {
    return error.message
  }

  return fallbackMessage
}
