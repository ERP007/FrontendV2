import { useQuery } from '@tanstack/react-query'

import { api, isErrorResponse } from '@/shared/api'

import { ADMIN_TENANCY_OPTION, toUserTenancyOption } from '../model/user-tenancy'

import type { ErrorResponse } from '@/shared/api'
import type { UserTenancyOption, WarehouseOption } from '../model/user-tenancy'

interface WarehouseOptionsResponse {
  content: WarehouseOption[]
}

const TENANCY_OPTIONS_PATH = '/inventory/warehouses/options'

export const userTenancyOptionsQueryKey = ['user-tenancy-options'] as const

function toWarehouseOption(value: unknown): WarehouseOption | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const option = value as Record<string, unknown>
  const code = typeof option.code === 'string'
    ? option.code
    : typeof option.tenancyCode === 'string'
      ? option.tenancyCode
      : typeof option.warehouseCode === 'string'
        ? option.warehouseCode
        : null
  const name = typeof option.name === 'string'
    ? option.name
    : typeof option.tenancyName === 'string'
      ? option.tenancyName
      : typeof option.warehouseName === 'string'
        ? option.warehouseName
        : null

  return code && name ? { code, name } : null
}

function unwrapWarehouseOptions(value: WarehouseOptionsResponse | WarehouseOption[]): WarehouseOption[] {
  const options = Array.isArray(value) ? value : value.content

  return Array.isArray(options) ? options.map(toWarehouseOption).filter((option) => option !== null) : []
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
      const response = await api.get<WarehouseOptionsResponse | WarehouseOption[]>(TENANCY_OPTIONS_PATH)
      const warehouseOptions = unwrapWarehouseOptions(response.data).map(toUserTenancyOption)

      return uniqueTenancyOptions([ADMIN_TENANCY_OPTION, ...warehouseOptions])
    },
  })
}
