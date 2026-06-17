import { useQuery } from '@tanstack/react-query'

import { api } from '@/shared/api'

import { detailToDraftLines, detailToFormValues } from '../model/po-form'
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

// 상세 조회와 동일한 queryKey → React Query 캐시를 공유하고 select만 다르게 적용한다.
const purchaseOrderFormQueryKey = (code: string) =>
  ['purchase-orders', 'detail', code] as const

export function usePurchaseOrderFormQuery(code: string) {
  return useQuery({
    enabled: Boolean(code),
    queryFn: async () => {
      const response = await api.get<PurchaseOrderDetailResponse>(
        `/procurement-orders/${code}`,
      )
      return response.data
    },
    queryKey: purchaseOrderFormQueryKey(code),
    select: (detail): PurchaseOrderFormData => ({
      lines: detailToDraftLines(detail),
      status: detail.status,
      values: detailToFormValues(detail),
      vendor: detail.vendor,
    }),
    staleTime: 60_000,
  })
}
