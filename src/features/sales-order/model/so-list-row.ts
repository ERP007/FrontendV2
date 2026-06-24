import { IN_PROGRESS_STATUSES, ORDER_PROGRESS_LABELS, SO_STATUS_LABELS } from './ui-types'
import type {
  BranchSalesOrderSummary,
  HqSalesOrderSummary,
  OrderProgress,
  SalesOrderStatus,
} from './types'

// =============================================================================
// 지점 목록 행 (SO #11)
// =============================================================================
export interface BranchSalesOrderRow {
  code: string
  inProgress: boolean
  itemCount: number
  progress: OrderProgress
  progressLabel: string
  requestedAt: string | null
  status: SalesOrderStatus
  statusLabel: string
}

export function mapBranchSalesOrderRow(summary: BranchSalesOrderSummary): BranchSalesOrderRow {
  return {
    code: summary.code,
    inProgress: IN_PROGRESS_STATUSES.includes(summary.status),
    itemCount: summary.itemCount,
    progress: summary.progress,
    progressLabel: ORDER_PROGRESS_LABELS[summary.progress],
    requestedAt: summary.request?.requestedAt ?? null,
    status: summary.status,
    statusLabel: SO_STATUS_LABELS[summary.status],
  }
}

// =============================================================================
// 본사 목록 행 (SO #12)
// =============================================================================
export interface HqSalesOrderRow {
  code: string
  fromWarehouseCode: string
  fromWarehouseName: string | null
  itemCount: number
  progress: OrderProgress
  progressLabel: string
  requestedAt: string | null
  requesterName: string | null
  requesterPosition: string | null
  status: SalesOrderStatus
  statusLabel: string
}

export function mapHqSalesOrderRow(summary: HqSalesOrderSummary): HqSalesOrderRow {
  return {
    code: summary.code,
    fromWarehouseCode: summary.fromWarehouse.code,
    fromWarehouseName: summary.fromWarehouse.name,
    itemCount: summary.itemCount,
    progress: summary.progress,
    progressLabel: ORDER_PROGRESS_LABELS[summary.progress],
    requestedAt: summary.request?.requestedAt ?? null,
    requesterName: summary.request?.requestedBy.name ?? null,
    requesterPosition: summary.request?.requestedBy.position ?? null,
    status: summary.status,
    statusLabel: SO_STATUS_LABELS[summary.status],
  }
}
