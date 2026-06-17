import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { detailToDraftLines, detailToFormValues } from '../model/po-form'
import { purchaseOrderKeys } from '../model/po-query-keys'
import type { PoDraftLine } from '../model/ui-types'
import type { PurchaseOrderDraftFormValues } from '../model/po-schema'
import type {
  PurchaseOrderDetailResponse,
  PurchaseOrderStatus,
  VendorRef,
} from '../model/types'

export interface PurchaseOrderFormData {
  lines: PoDraftLine[]
  status: PurchaseOrderStatus
  values: PurchaseOrderDraftFormValues
  vendor: VendorRef
}

export function usePurchaseOrderFormQuery(code: string) {
  // 상세 조회(usePurchaseOrderQuery)와 동일한 queryKey → 캐시를 공유하고 select만 다르게 적용한다.
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderDetailResponse>(
        `/procurement-orders/${code}`,
      )
      return response.data
    },
    queryKey: purchaseOrderKeys.detail(code),
    select: (detail): PurchaseOrderFormData => ({
      lines: detailToDraftLines(detail),
      status: detail.status,
      values: detailToFormValues(detail),
      vendor: detail.vendor,
    }),
    staleTime: 60_000,
  })
}
