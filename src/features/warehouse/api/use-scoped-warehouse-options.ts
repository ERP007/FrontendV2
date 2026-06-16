import { useMemo } from 'react'

import { useSession } from '@/shared/auth/session'

import { DEFAULT_WAREHOUSE_FILTER, DEFAULT_WAREHOUSE_SORT } from '../model/types'

import { useWarehouseListQuery } from './use-warehouse-list-query'

export interface ScopedWarehouseOption {
  code: string
  name: string
}

export interface ScopedWarehouseOptions {
  /** BRANCH면 자기 창고 코드(드롭다운을 이 창고로 고정하고 "전체"를 숨긴다), 그 외 null. */
  branchLockedCode: string | null
  /** BRANCH 사용자 여부. true면 드롭다운에서 "전체"를 빼고 자기 창고만 노출한다. */
  isBranch: boolean
  /** 드롭다운에 노출할 창고 목록. BRANCH는 자기 창고만, 그 외는 전체. */
  options: ScopedWarehouseOption[]
}

/**
 * 재고 조회·이력 화면의 창고 드롭다운 옵션을 사용자 소속(Tenancy)에 맞춰 스코핑한다.
 *
 * BRANCH 사용자는 타 지점 창고를 UI에서도 보면 안 되므로 자기 창고(tenancyCode)만 노출한다
 * (실제 데이터 접근 차단은 백엔드가 하지만, 드롭다운에 타 창고가 노출되는 UX 문제를 막는다).
 * ADMIN·HQ는 전체 창고를 노출한다. 창고 목록 API는 전 역할 공통으로 전체를 내려주므로 여기서 클라이언트 사이드로 거른다.
 */
export function useScopedWarehouseOptions(): ScopedWarehouseOptions {
  const sessionQuery = useSession()
  const warehouseListQuery = useWarehouseListQuery({
    ...DEFAULT_WAREHOUSE_FILTER,
    sort: DEFAULT_WAREHOUSE_SORT,
  })

  return useMemo(() => {
    const all = (warehouseListQuery.data?.content ?? []).map((warehouse) => ({
      code: warehouse.code,
      name: warehouse.name,
    }))
    const isBranch = sessionQuery.data?.tenancyType === 'BRANCH'
    const branchLockedCode = isBranch ? (sessionQuery.data?.tenancyCode ?? null) : null
    // BRANCH는 항상 자기 창고로만 거른다(코드가 비어 있으면 빈 목록 — 타 창고가 새지 않게).
    const options = isBranch ? all.filter((warehouse) => warehouse.code === branchLockedCode) : all
    return { branchLockedCode, isBranch, options }
  }, [warehouseListQuery.data, sessionQuery.data])
}
