import { useQuery } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ErrorResponse } from '@/shared/api'
import type { UserApiRole, UserDetailResponse, UserStatus } from '../model/types'

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

export const userDetailQueryKeys = {
  detail: (userId?: string | null) => ['users', 'detail', userId ?? ''] as const,
}

function hasContent<T>(value: T | ApiContentResponse<T>): value is ApiContentResponse<T> {
  return typeof value === 'object' && value !== null && 'content' in value
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isUserDetailResponse(value: unknown): value is UserDetailResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const response = value as UserDetailResponse

  return (
    isNullableString(response.createdAt) &&
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

function unwrapUserDetailResponse(value: UserDetailResponse | ApiContentResponse<UserDetailResponse>) {
  const data = hasContent(value) ? value.content : value

  if (!isUserDetailResponse(data)) {
    throw new Error('사용자 상세 응답 형식이 올바르지 않습니다.')
  }

  return data
}

export function getUserDetailErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getUserDetailErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '사용자 상세 정보를 불러오지 못했습니다.'
}

function getUserDetailErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status === 403) {
    return '사용자 상세 조회 권한이 없습니다.'
  }

  if (error.status === 404) {
    return '사용자 상세 정보를 찾지 못했습니다.'
  }

  if (error.status === 405) {
    return '사용자 상세 조회 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  return detail || '사용자 상세 정보를 불러오지 못했습니다.'
}

export function useUserDetailQuery(userId?: string | null, enabled = true) {
  return useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: async ({ signal }) => {
      const response = await api.get<UserDetailResponse | ApiContentResponse<UserDetailResponse>>(
        `/users/${encodeURIComponent(userId ?? '')}`,
        { signal },
      )

      return unwrapUserDetailResponse(response.data)
    },
    queryKey: userDetailQueryKeys.detail(userId),
  })
}
