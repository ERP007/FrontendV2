import { useMutation } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import { getUserTenancyOption } from '../model/user-tenancy'

import type { ErrorResponse } from '@/shared/api'
import type { CreateUserRequest, CreateUserResponse, UserFormValues } from '../model/types'

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

function toCreateUserRequest(values: UserFormValues): CreateUserRequest {
  const tenancy = getUserTenancyOption(values.tenancyCode)

  if (!tenancy) {
    throw new Error('소속 정보가 올바르지 않습니다.')
  }

  return {
    display_name: values.name.trim(),
    email: values.email.trim(),
    employee_no: values.empNo.trim(),
    initial_password: values.passwordMode === 'MANUAL' ? values.initialPassword.trim() : '',
    password_issue_mode: values.passwordMode,
    position: values.rank.trim(),
    role: values.role,
    tenancy: tenancy.type,
    tenancy_code: tenancy.code,
  }
}

function unwrapCreateUserResponse(value: CreateUserResponse | ApiContentResponse<CreateUserResponse>) {
  const data = hasContent(value) ? value.content : value

  if (!isCreateUserResponse(data)) {
    throw new Error('사용자 등록 응답 형식이 올바르지 않습니다.')
  }

  return data
}

export function getCreateUserErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getCreateUserErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '사용자 등록 중 오류가 발생했습니다.'
}

function getCreateUserErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()
  const normalizedDetail = detail.toLowerCase()

  if (error.errorCode === 'USR-002' || normalizedDetail.includes('user already exists')) {
    return '이미 사용 중인 사번 또는 이메일입니다.'
  }

  if (error.status === 405) {
    return '사용자 등록 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  if (normalizedDetail.includes('validation') || normalizedDetail.includes('invalid')) {
    return '입력값을 확인해주세요.'
  }

  return detail || '사용자 등록 중 오류가 발생했습니다.'
}

export function useCreateUserMutation() {
  return useMutation({
    mutationFn: async (values: UserFormValues) => {
      const response = await api.post<CreateUserResponse | ApiContentResponse<CreateUserResponse>>(
        '/users/create',
        toCreateUserRequest(values),
      )

      return unwrapCreateUserResponse(response.data)
    },
  })
}
