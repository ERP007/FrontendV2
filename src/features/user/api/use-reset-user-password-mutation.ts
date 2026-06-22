import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ErrorResponse } from '@/shared/api'
import type { CreateUserResponse } from '../model/types'

interface ApiContentResponse<T> {
  content: T
}

function hasContent<T>(value: T | ApiContentResponse<T>): value is ApiContentResponse<T> {
  return typeof value === 'object' && value !== null && 'content' in value
}

function isCreateUserResponse(value: unknown): value is CreateUserResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as CreateUserResponse

  return (
    'user' in response &&
    (typeof response.temporaryPassword === 'string' || response.temporaryPassword === null)
  )
}

function unwrapResetPasswordResponse(value: CreateUserResponse | ApiContentResponse<CreateUserResponse>) {
  const data = hasContent(value) ? value.content : value

  if (!isCreateUserResponse(data)) {
    throw new Error('비밀번호 초기화 응답 형식이 올바르지 않습니다.')
  }

  return data
}

export function getResetPasswordErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getResetPasswordErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '비밀번호 초기화에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

function getResetPasswordErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status === 400) {
    return detail || '비밀번호 초기화 요청값을 확인해주세요.'
  }

  if (error.status === 404) {
    return '비밀번호를 초기화할 사용자를 찾지 못했습니다.'
  }

  if (error.status === 405) {
    return '비밀번호 초기화 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  return detail || '비밀번호 초기화에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

export function useResetUserPasswordMutation() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.patch<CreateUserResponse | ApiContentResponse<CreateUserResponse>>(
        `/users/${encodeURIComponent(userId)}/reset-password`,
      )

      return unwrapResetPasswordResponse(response.data)
    },
  })
}
