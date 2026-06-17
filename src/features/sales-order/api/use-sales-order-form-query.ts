import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { detailToDraftLines, detailToFormValues } from '../model/so-form'
import { salesOrderKeys } from '../model/so-query-keys'
import type { SoLine } from '../model/so-ui-model'
import type { SoFormValues } from '../model/so-draft-schema'
import type { BranchSalesOrderDetailResponse, SalesOrderStatus } from '../model/types'

export interface SalesOrderFormData {
  lines: SoLine[]
  status: SalesOrderStatus
  values: SoFormValues
}

/** SO #10 지점 상세를 수정 폼 입력 형태로 변환해 조회 (상세 조회와 캐시 공유, select 만 다름) */
export function useSalesOrderFormQuery(code: string) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<BranchSalesOrderDetailResponse>(
        `/sales-orders/branch/${code}`,
      )
      return response.data
    },
    queryKey: salesOrderKeys.branchDetail(code),
    select: (detail): SalesOrderFormData => ({
      lines: detailToDraftLines(detail),
      status: detail.status,
      values: detailToFormValues(detail),
    }),
  })
}
