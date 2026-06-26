import { useQuery } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import type { ErrorResponse } from '@/shared/api'
import type { UserActivity } from '../model/types'

interface UserActivityApiItem {
  actionType: string
  content: string | null
  employee_no: string
  id: number
  occurredAt: string
  status: string | null
  title: string
}

interface UserActivityApiResponse {
  content: UserActivityApiItem[]
}

export const myActivityQueryKey = ['users', 'me', 'activity-logs'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isUserActivityApiItem(value: unknown): value is UserActivityApiItem {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'number' &&
    typeof value.employee_no === 'string' &&
    typeof value.actionType === 'string' &&
    typeof value.title === 'string' &&
    isNullableString(value.content) &&
    isNullableString(value.status) &&
    typeof value.occurredAt === 'string'
  )
}

function isUserActivityApiResponse(value: unknown): value is UserActivityApiResponse {
  return isRecord(value) && Array.isArray(value.content) && value.content.every(isUserActivityApiItem)
}

function toUserActivity(item: UserActivityApiItem): UserActivity {
  return {
    actionType: item.actionType,
    content: item.content,
    employeeNo: item.employee_no,
    id: item.id,
    occurredAt: item.occurredAt,
    status: item.status,
    title: item.title,
  }
}

function unwrapUserActivityResponse(value: unknown) {
  const data = isRecord(value) && isUserActivityApiResponse(value.content) ? value.content : value

  if (!isUserActivityApiResponse(data)) {
    throw new Error('최근 활동 응답 형식이 올바르지 않습니다.')
  }

  return data.content.map(toUserActivity)
}

export function getMyActivityErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getMyActivityErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '최근 활동을 불러오지 못했습니다.'
}

function getMyActivityErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status === 403) {
    return '최근 활동 조회 권한이 없습니다.'
  }

  if (error.status === 404) {
    return '최근 활동 내역을 찾지 못했습니다.'
  }

  if (error.status === 405) {
    return '최근 활동 조회 요청 방식이 허용되지 않습니다.'
  }

  if (error.status === 502) {
    return 'Gateway가 UserService에서 정상 응답을 받지 못했습니다.'
  }

  if (error.status >= 500) {
    return '일시적 오류가 발생했습니다. 다시 시도해주세요.'
  }

  return detail || '최근 활동을 불러오지 못했습니다.'
}

export function useMyActivityQuery() {
  return useQuery({
    queryFn: async ({ signal }) => {
      const response = await api.get<unknown>('/users/me/activity-logs', { signal })
      return unwrapUserActivityResponse(response.data)
    },
    queryKey: myActivityQueryKey,
    staleTime: 60_000,
  })
}
