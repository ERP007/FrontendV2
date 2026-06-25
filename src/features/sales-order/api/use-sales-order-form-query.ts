import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { detailToDraftLines, detailToFormValues } from '../model/so-form'
import { salesOrderKeys } from '../model/so-query-keys'
import type { SoLine } from '../model/ui-types'
import type { SoFormValues } from '../model/so-draft-schema'
import type {
  SalesOrderDetailResponse,
  SalesOrderStatus,
  WarehouseInfo,
} from '../model/types'

export interface SalesOrderFormData {
  fromWarehouse: WarehouseInfo // 출고 창고 (현재고·안전재고 batch 조회 기준)
  lines: SoLine[]
  status: SalesOrderStatus
  toWarehouse: WarehouseInfo // 입고 창고 select 옵션 fallback (hq 목록에 없을 수 있음)
  values: SoFormValues
}

/** SO #13 발주 상세를 수정 폼 입력 형태로 변환해 조회 (상세 조회와 캐시 공유, select 만 다름) */
export function useSalesOrderFormQuery(code: string) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<SalesOrderDetailResponse>(`/sales-orders/${code}`)
      return response.data
    },
    queryKey: salesOrderKeys.detail(code),
    select: (detail): SalesOrderFormData => ({
      fromWarehouse: detail.fromWarehouse,
      lines: detailToDraftLines(detail),
      status: detail.status,
      toWarehouse: detail.toWarehouse,
      values: detailToFormValues(detail),
    }),
  })
}
