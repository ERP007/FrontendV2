import type { BranchSalesOrderListParams } from '../api/use-branch-sales-orders-query'
import type { HqSalesOrderListParams } from '../api/use-hq-sales-orders-query'

/**
 * SO 관련 React Query 캐시 키 팩토리.
 * 계층 구조라 상위 키로 invalidate 하면 하위가 모두 무효화된다.
 * 지점(branch)·본사(hq) 화면이 목록·상세를 분리해서 본다.
 */
export const salesOrderKeys = {
  all: ['sales-orders'] as const,

  branchLists: () => [...salesOrderKeys.all, 'branch', 'list'] as const,
  branchList: (params: BranchSalesOrderListParams) =>
    [...salesOrderKeys.branchLists(), params] as const,
  branchDetails: () => [...salesOrderKeys.all, 'branch', 'detail'] as const,
  branchDetail: (code: string) => [...salesOrderKeys.branchDetails(), code] as const,

  hqLists: () => [...salesOrderKeys.all, 'hq', 'list'] as const,
  hqList: (params: HqSalesOrderListParams) => [...salesOrderKeys.hqLists(), params] as const,
  hqDetails: () => [...salesOrderKeys.all, 'hq', 'detail'] as const,
  hqDetail: (code: string) => [...salesOrderKeys.hqDetails(), code] as const,

  histories: (code: string) => [...salesOrderKeys.all, 'histories', code] as const,

  branchKpi: () => [...salesOrderKeys.all, 'kpi', 'branch'] as const,
  hqKpi: () => [...salesOrderKeys.all, 'kpi', 'hq'] as const,
}
