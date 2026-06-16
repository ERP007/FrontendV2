import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { warehouseListBaseKey } from './use-warehouse-list-query'

import type { Warehouse, WarehouseFormValues } from '../model/types'

/** HQ 유형은 소속 지점을 두지 않으므로 branchId를 null로 강제한다(백엔드 정합 규칙과 동일). */
function resolveBranchId(values: WarehouseFormValues): number | null {
  return values.type === 'HQ' ? null : values.branchId
}

/** 창고 등록 (POST /inventory/warehouses). ADMIN·HQ_MANAGER 전용. */
export function useWarehouseCreateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: WarehouseFormValues) => {
      await api.post('/inventory/warehouses', {
        address: values.address,
        branchId: resolveBranchId(values),
        code: values.code,
        name: values.name,
        type: values.type,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: warehouseListBaseKey }),
  })
}

export interface WarehouseUpdateInput {
  code: string
  values: WarehouseFormValues
  version: number
}

/**
 * 창고 수정 (PUT /inventory/warehouses/{code}). ADMIN·HQ_MANAGER 전용.
 * code는 불변이라 body에서 제외하고(포함 시 백엔드가 거부), version으로 낙관적 락을 검증한다.
 */
export function useWarehouseUpdateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ code, values, version }: WarehouseUpdateInput) => {
      await api.put(`/inventory/warehouses/${code}`, {
        address: values.address,
        branchId: resolveBranchId(values),
        name: values.name,
        type: values.type,
        version,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: warehouseListBaseKey }),
  })
}

export interface WarehouseActiveInput {
  active: boolean
  code: string
}

/**
 * 창고 활성 상태 전환 (PATCH /inventory/warehouses/{code}/active). ADMIN·HQ_MANAGER 전용.
 * 목록 응답엔 version이 없어, 전환 직전 상세를 조회해 최신 version으로 낙관적 락을 건다.
 */
export function useWarehouseActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ active, code }: WarehouseActiveInput) => {
      const detail = await api.get<Warehouse>(`/inventory/warehouses/${code}`)
      await api.patch(`/inventory/warehouses/${code}/active`, {
        active,
        version: detail.data.version,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: warehouseListBaseKey }),
  })
}
