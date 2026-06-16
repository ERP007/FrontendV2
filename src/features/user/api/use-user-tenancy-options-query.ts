import { useQuery } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import { ADMIN_TENANCY_OPTION, toUserTenancyOption } from '../model/user-tenancy'

import type { ErrorResponse } from '@/shared/api'
import type { UserTenancyOption, WarehouseOption } from '../model/user-tenancy'

interface WarehouseOptionsResponse {
  content: WarehouseOption[]
}

export const userTenancyOptionsQueryKey = ['user-tenancy-options'] as const

function isWarehouseOption(value: unknown): value is WarehouseOption {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const option = value as WarehouseOption

  return typeof option.code === 'string' && typeof option.name === 'string'
}

function unwrapWarehouseOptions(value: WarehouseOptionsResponse): WarehouseOption[] {
  return Array.isArray(value.content) ? value.content.filter(isWarehouseOption) : []
}

function uniqueTenancyOptions(options: UserTenancyOption[]) {
  const optionsByCode = new Map<string, UserTenancyOption>()

  options.forEach((option) => {
    optionsByCode.set(option.code, option)
  })

  return Array.from(optionsByCode.values())
}

export function getUserTenancyOptionsErrorMessage(error: unknown) {
  if (isErrorResponse(error)) {
    return getUserTenancyOptionsErrorDetail(error)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return '소속 목록을 불러오지 못했습니다.'
}

function getUserTenancyOptionsErrorDetail(error: ErrorResponse) {
  const detail = error.detail.trim()

  if (error.status >= 500) {
    return '소속 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
  }

  return detail || '소속 목록을 불러오지 못했습니다.'
}

export function useUserTenancyOptionsQuery() {
  return useQuery({
    queryKey: userTenancyOptionsQueryKey,
    queryFn: async () => {
      const response = await api.get<WarehouseOptionsResponse>('/inventory/warehouses/options')
      const warehouseOptions = unwrapWarehouseOptions(response.data).map(toUserTenancyOption)

      return uniqueTenancyOptions([ADMIN_TENANCY_OPTION, ...warehouseOptions])
    },
  })
}
