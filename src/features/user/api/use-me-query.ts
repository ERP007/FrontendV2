import { useQuery } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ErrorResponse } from '@/shared/api'
import type { MyPageResponse, UserApiRole, UserStatus } from '../model/types'

interface ApiContentResponse<T> {
  content: T
}

const userApiRoles = new Set<UserApiRole>([
  'ADMIN',
  'HQ_MANAGER',
  'HQ_STAFF',
  'BRANCH_MANAGER',
  'BRANCH_STAFF',
  'WAREHOUSE_STAFF',
  'WAREHOUSE_MANAGER',
])
const userStatuses = new Set<UserStatus>(['ACTIVE', 'PENDING', 'SUSPENDED'])

export const meQueryKey = ['users', 'me'] as const

function hasContent<T>(value: T | ApiContentResponse<T>): value is ApiContentResponse<T> {
  return typeof value === 'object' && value !== null && 'content' in value
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isMyPageResponse(value: unknown): value is MyPageResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as MyPageResponse

  return (
    typeof response.email === 'string' &&
    typeof response.employeeNo === 'string' &&
    typeof response.joinedAt === 'string' &&
    isNullableString(response.lastChangedPassAt) &&
    isNullableString(response.lastLoginAt) &&
    typeof response.name === 'string' &&
    isNullableString(response.position) &&
    userApiRoles.has(response.role) &&
    userStatuses.has(response.status) &&
    typeof response.tenancyCode === 'string' &&
    typeof response.tenancyName === 'string' &&
    typeof response.userId === 'string'
  )
}

function unwrapMyPageResponse(value: MyPageResponse | ApiContentResponse<MyPageResponse>) {
  const data = hasContent(value) ? value.content : value

  if (!isMyPageResponse(data)) {
    throw new Error('마이페이지 응답 형식이 올바르지 않습니다.')
  }

  return data
}

export function getMeErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getMeErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '마이페이지 정보를 불러오지 못했습니다.'
}

function getMeErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status === 403) {
    return '마이페이지 조회 권한이 없습니다.'
  }

  if (error.status === 404) {
    return '마이페이지 정보를 찾지 못했습니다.'
  }

  if (error.status === 405) {
    return '마이페이지 조회 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  return detail || '마이페이지 정보를 불러오지 못했습니다.'
}

export function useMeQuery() {
  return useQuery({
    queryFn: async ({ signal }) => {
      const response = await api.get<MyPageResponse | ApiContentResponse<MyPageResponse>>('/users/me', {
        signal,
      })

      return unwrapMyPageResponse(response.data)
    },
    queryKey: meQueryKey,
    staleTime: 5 * 60_000,
  })
}
