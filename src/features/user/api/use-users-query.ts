import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ErrorResponse } from '@/shared/api'
import type { FetchUsersParams, UserListItem, UserListResponse } from '../model/types'

export const usersQueryKey = ['users'] as const

export const usersQueryKeys = {
  all: usersQueryKey,
  list: (params: FetchUsersParams) => [...usersQueryKey, 'list', params] as const,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isUserListItem(value: unknown): value is UserListItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.userId === 'string' &&
    typeof value.employeeNo === 'string' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    typeof value.department === 'string' &&
    typeof value.role === 'string' &&
    typeof value.status === 'string' &&
    typeof value.joinedAt === 'string'
  )
}

function isUserListResponse(value: unknown): value is UserListResponse {
  if (!isRecord(value)) {
    return false
  }

  return (
    Array.isArray(value.content) &&
    value.content.every(isUserListItem) &&
    typeof value.page === 'number' &&
    typeof value.size === 'number' &&
    typeof value.totalElements === 'number' &&
    typeof value.totalPages === 'number' &&
    typeof value.hasPrevious === 'boolean' &&
    typeof value.hasNext === 'boolean'
  )
}

function unwrapUserListResponse(value: unknown) {
  if (isUserListResponse(value)) {
    return value
  }

  if (isRecord(value) && isUserListResponse(value.content)) {
    return value.content
  }

  throw new Error('사용자 목록 응답 형식이 올바르지 않습니다.')
}

function toUsersSearchParams(params: FetchUsersParams) {
  const keyword = params.keyword?.trim()

  return {
    ...(keyword ? { keyword } : {}),
    page: params.page,
    role: params.role,
    size: params.size,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    status: params.status,
    tenancy_code: params.tenancyCode,
  }
}

export function getUsersErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getUsersErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '사용자 목록을 불러오지 못했습니다.'
}

function getUsersErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status === 403) {
    return '사용자 목록 조회 권한이 없습니다.'
  }

  if (error.status === 405) {
    return '사용자 목록 조회 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  return detail || '사용자 목록을 불러오지 못했습니다.'
}

export function useUsersQuery(params: FetchUsersParams) {
  return useQuery({
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) => {
      const response = await api.get<UserListResponse | { content: UserListResponse }>('/users', {
        params: toUsersSearchParams(params),
        signal,
      })

      return unwrapUserListResponse(response.data)
    },
    queryKey: usersQueryKeys.list(params),
    staleTime: 10_000,
  })
}
