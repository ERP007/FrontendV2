import axios from 'axios'

export interface ErrorResponse {
  status: number
  detail: string
  errorCode: string
  timestamp: string
}

const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR'
const NETWORK_ERROR_CODE = 'NETWORK_ERROR'

function getTimestamp() {
  return new Date().toISOString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.status === 'number' &&
    typeof value.detail === 'string' &&
    typeof value.errorCode === 'string' &&
    typeof value.timestamp === 'string'
  )
}

export function normalizeErrorResponse(error: unknown): ErrorResponse {
  if (isErrorResponse(error)) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (isErrorResponse(responseData)) {
      return responseData
    }

    return {
      status: error.response?.status ?? 0,
      detail: error.message || '요청 처리 중 오류가 발생했습니다.',
      errorCode: error.response ? UNKNOWN_ERROR_CODE : NETWORK_ERROR_CODE,
      timestamp: getTimestamp(),
    }
  }

  if (error instanceof Error) {
    return {
      status: 0,
      detail: error.message,
      errorCode: UNKNOWN_ERROR_CODE,
      timestamp: getTimestamp(),
    }
  }

  return {
    status: 0,
    detail: '요청 처리 중 오류가 발생했습니다.',
    errorCode: UNKNOWN_ERROR_CODE,
    timestamp: getTimestamp(),
  }
}
