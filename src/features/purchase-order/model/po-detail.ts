import type { FgDomainStatus } from '@/shared/ui'

import { PO_STATUS_LABELS } from './po-list-row'
import { PO_PROGRESS_BADGE_STATUS, PO_PROGRESS_LABELS } from './ui-types'
import type {
  PersonInfo,
  PurchaseOrderDetailLine,
  PurchaseOrderDetailResponse,
  PurchaseOrderProgress,
  PurchaseOrderStatus,
  VendorRef,
  WarehouseRef,
} from './types'

export interface PurchaseOrderDetailLineRow {
  amount: string
  id: number
  name: string
  quantity: string
  sku: string
  unit: string
  unitPrice: string
}

export interface PurchaseOrderDetail {
  approvedBy: PersonInfo | null
  approvedByLabel: string
  code: string
  createdAt: string
  currency: string
  lineCount: number
  lines: PurchaseOrderDetailLineRow[]
  memo: string | null
  progress: PurchaseOrderProgress
  progressBadgeStatus: FgDomainStatus
  progressLabel: string
  status: PurchaseOrderStatus
  statusLabel: string
  totalAmount: string
  totalQuantity: string
  vendor: VendorRef
  warehouse: WarehouseRef
}

function formatAmount(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString('ko-KR')}`
}

function formatApprovedBy(person: PersonInfo | null): string {
  if (!person) return '—'
  return person.position ? `${person.name} · ${person.position}` : person.name
}

function mapLine(line: PurchaseOrderDetailLine, currency: string): PurchaseOrderDetailLineRow {
  return {
    amount: formatAmount(line.quantity * line.unitPrice, currency),
    id: line.id,
    name: line.name ?? '—',
    quantity: line.quantity.toLocaleString('ko-KR'),
    sku: line.sku,
    unit: line.unit ?? '—',
    unitPrice: line.unitPrice.toLocaleString('ko-KR'),
  }
}

export function mapPurchaseOrderDetail(
  detail: PurchaseOrderDetailResponse,
): PurchaseOrderDetail {
  const totalQuantity = detail.lines.reduce((sum, line) => sum + line.quantity, 0)

  return {
    approvedBy: detail.approvedBy,
    approvedByLabel: formatApprovedBy(detail.approvedBy),
    code: detail.code,
    createdAt: detail.createdAt,
    currency: detail.currency,
    lineCount: detail.lines.length,
    lines: detail.lines.map((line) => mapLine(line, detail.currency)),
    memo: detail.memo,
    progress: detail.progress,
    progressBadgeStatus: PO_PROGRESS_BADGE_STATUS[detail.progress],
    progressLabel: PO_PROGRESS_LABELS[detail.progress],
    status: detail.status,
    statusLabel: PO_STATUS_LABELS[detail.status],
    totalAmount: formatAmount(detail.totalAmount, detail.currency),
    totalQuantity: totalQuantity.toLocaleString('ko-KR'),
    vendor: detail.vendor,
    warehouse: detail.warehouse,
  }
}
