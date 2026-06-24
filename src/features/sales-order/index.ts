// =============================================================================
// sales-order feature public API
// =============================================================================

// ----- 백엔드 DTO (model/types) -----
export type {
  ApproveSalesOrderRequest,
  BranchSalesOrderKpiResponse,
  BranchSalesOrderPageResponse,
  BranchSalesOrderQuery,
  BranchSalesOrderSummary,
  CancelSalesOrderRequest,
  CarrierType,
  CreateDraftSalesOrderRequest,
  CreateSalesOrderRequest,
  DeliverSalesOrderRequest,
  HqSalesOrderKpiResponse,
  HqSalesOrderPageResponse,
  HqSalesOrderQuery,
  HqSalesOrderSummary,
  OrderProgress,
  PageSize,
  PersonInfo,
  Priority,
  ProgressOutcome,
  RejectReasonCategory,
  RejectSalesOrderRequest,
  RequestInfo,
  SalesOrderDetailResponse,
  SalesOrderHistoryListResponse,
  SalesOrderHistoryResponse,
  SalesOrderLineRequest,
  SalesOrderLineResponse,
  SalesOrderProgressResponse,
  SalesOrderSortField,
  SalesOrderStatus,
  SalesOrderStatusChangedResponse,
  SortDirection,
  StatusChangeMeta,
  SubmitSalesOrderRequest,
  UpdateDraftSalesOrderRequest,
  WarehouseInfo,
} from './model/types'

// ----- 쿼리 키 / 캐시 무효화 -----
export { salesOrderKeys } from './model/so-query-keys'
export { invalidateSalesOrder, invalidateSalesOrderCollections } from './api/so-cache'

// ----- mutations -----
export { useCreateSalesOrderMutation } from './api/use-create-sales-order-mutation'
export { useCreateSalesOrderDraftMutation } from './api/use-create-sales-order-draft-mutation'
export { useUpdateSalesOrderDraftMutation } from './api/use-update-sales-order-draft-mutation'
export { useSubmitSalesOrderMutation } from './api/use-submit-sales-order-mutation'
export { useRequestSalesOrderMutation } from './api/use-request-sales-order-mutation'
export { useApproveSalesOrderMutation } from './api/use-approve-sales-order-mutation'
export { useRejectSalesOrderMutation } from './api/use-reject-sales-order-mutation'
export { useCancelSalesOrderMutation } from './api/use-cancel-sales-order-mutation'
export { useSalesOrderDeliverMutation } from './api/use-sales-order-deliver-mutation'

// ----- queries -----
export { useBranchSalesOrdersQuery } from './api/use-branch-sales-orders-query'
export type { BranchSalesOrderListParams } from './api/use-branch-sales-orders-query'
export { useBranchSalesOrderQuery } from './api/use-branch-sales-order-query'
export type { SalesOrderDetail, SalesOrderDetailLine } from './model/so-detail'
export { useHqSalesOrdersQuery } from './api/use-hq-sales-orders-query'
export type { HqSalesOrderListParams } from './api/use-hq-sales-orders-query'
export { useHqSalesOrderQuery } from './api/use-hq-sales-order-query'
export { useSalesOrderFormQuery } from './api/use-sales-order-form-query'
export type { SalesOrderFormData } from './api/use-sales-order-form-query'
export { useSalesOrderBranchKpiQuery } from './api/use-sales-order-branch-kpi-query'
export { useSalesOrderHqKpiQuery } from './api/use-sales-order-hq-kpi-query'
export { useSalesOrderHistoriesQuery } from './api/use-sales-order-histories-query'
export type { SalesOrderHistoryRow } from './model/so-history'
export { useSalesOrderProgressQuery } from './api/use-sales-order-progress-query'

// ----- 화면 모델 / 라벨 / 헬퍼 (model/ui-types) -----
export {
  CARRIER_TYPE_LABELS,
  emptySoDraftLine,
  ORDER_PROGRESS_BADGE_STATUS,
  ORDER_PROGRESS_LABELS,
  SO_TAB_STATUS_MAP,
} from './model/ui-types'
export type { SoLine as SoDraftLine, SoStatusTab } from './model/ui-types'
export type { BranchSalesOrderRow, HqSalesOrderRow } from './model/so-list-row'
export { soDraftFormSchema } from './model/so-draft-schema'
export type { SoFormValues } from './model/so-draft-schema'
export {
  defaultSoFormValues,
  detailToDraftLines,
  detailToFormValues,
  linesToRequest,
} from './model/so-form'

// ----- UI -----
export { SoBranchStatusFilter } from './ui/SoBranchStatusFilter'
export { SoHistoryTimeline } from './ui/SoHistoryTimeline'
export { SoCancelModal } from './ui/SoCancelModal'
export { SoRejectModal } from './ui/SoRejectModal'
export { SoLineEditor } from './ui/SoLineEditor'
export type { SoLineSearchPanelProps } from './ui/SoLineEditor'
export { SoFilterBar } from './ui/SoFilterBar'
export type { SoFilterBarValues } from './ui/SoFilterBar'
export { SoForm } from './ui/SoForm'
export type { SoFormProps, SoFormWarehouseOption } from './ui/SoForm'
export { SoBranchKpiCards, SoHqKpiCards } from './ui/SoKpiCards'
export { SoNoteBox } from './ui/SoLineTables'
export { SoBranchTable, SoTable } from './ui/SoTable'
