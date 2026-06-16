import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ErrorResponse } from '@/shared/api'
import type { SuspendToggleResponse, UserStatus } from '../model/types'

interface ApiContentResponse<T> {
  content: T
}

interface ToggleUserSuspensionParams {
  suspended: boolean
  userId: string
}

const userStatuses = new Set<UserStatus>(['ACTIVE', 'PENDING', 'SUSPENDED'])

function hasContent<T>(value: T | ApiContentResponse<T>): value is ApiContentResponse<T> {
  return typeof value === 'object' && value !== null && 'content' in value
}

function isSuspendToggleResponse(value: unknown): value is SuspendToggleResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as SuspendToggleResponse

  return (
    typeof response.email === 'string' &&
    typeof response.employeeNo === 'string' &&
    typeof response.name === 'string' &&
    typeof response.userId === 'string' &&
    userStatuses.has(response.status)
  )
}

function unwrapSuspendToggleResponse(
  value: SuspendToggleResponse | ApiContentResponse<SuspendToggleResponse>,
) {
  const data = hasContent(value) ? value.content : value

  if (!isSuspendToggleResponse(data)) {
    throw new Error('정지 상태 변경 응답 형식이 올바르지 않습니다.')
  }

  return data
}

export function getToggleUserSuspensionErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getToggleUserSuspensionErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '정지 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

function getToggleUserSuspensionErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status === 400) {
    return detail || '정지 상태 변경 요청값을 확인해주세요.'
  }

  if (error.status === 404) {
    return '정지 상태를 변경할 사용자를 찾지 못했습니다.'
  }

  if (error.status === 405) {
    return '정지 상태 변경 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  return detail || '정지 상태 변경에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

export function useToggleUserSuspensionMutation() {
  return useMutation({
    mutationFn: async ({ suspended, userId }: ToggleUserSuspensionParams) => {
      const response = await api.patch<SuspendToggleResponse | ApiContentResponse<SuspendToggleResponse>>(
        `/users/${encodeURIComponent(userId)}/suspension`,
        { suspended },
      )

      return unwrapSuspendToggleResponse(response.data)
    },
  })
}
