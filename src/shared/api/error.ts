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

function parseJsonString(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue || (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('['))) {
    return null
  }

  try {
    return JSON.parse(trimmedValue) as unknown
  } catch {
    return null
  }
}

function normalizeErrorResponseShape(value: unknown, fallbackStatus = 0): ErrorResponse | null {
  if (typeof value === 'string') {
    const parsedValue = parseJsonString(value)

    return parsedValue ? normalizeErrorResponseShape(parsedValue, fallbackStatus) : null
  }

  if (!isRecord(value)) {
    return null
  }

  const status = typeof value.status === 'number' ? value.status : fallbackStatus

  if (status === 0) {
    return null
  }

  const detail = typeof value.detail === 'string'
    ? value.detail
    : typeof value.message === 'string'
      ? value.message
      : null

  if (detail === null) {
    return null
  }

  return {
    status,
    detail,
    errorCode: typeof value.errorCode === 'string' ? value.errorCode : UNKNOWN_ERROR_CODE,
    timestamp: typeof value.timestamp === 'string' ? value.timestamp : getTimestamp(),
  }
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
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data
    const normalizedResponseData = normalizeErrorResponseShape(responseData, error.response?.status ?? 0)

    if (normalizedResponseData) {
      return normalizedResponseData
    }

    const requestResponseText = typeof error.request?.responseText === 'string'
      ? error.request.responseText
      : null
    const normalizedRequestResponse = normalizeErrorResponseShape(
      requestResponseText,
      error.response?.status ?? 0,
    )

    if (normalizedRequestResponse) {
      return normalizedRequestResponse
    }

    return {
      status: error.response?.status ?? 0,
      detail: error.message || '요청 처리 중 오류가 발생했습니다.',
      errorCode: error.response ? UNKNOWN_ERROR_CODE : NETWORK_ERROR_CODE,
      timestamp: getTimestamp(),
    }
  }

  const normalizedError = normalizeErrorResponseShape(error)

  if (normalizedError) {
    return normalizedError
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
