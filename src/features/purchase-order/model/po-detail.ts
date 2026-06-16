import { formatDday, isOverdue } from '@/shared/lib/format'

import { PO_STATUS_LABELS } from './po-list-row'
import type {
  PersonInfo,
  PurchaseOrderDetailLine,
  PurchaseOrderDetailResponse,
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
  dday: string
  delayed: boolean
  desiredArrivalDate: string
  lineCount: number
  lines: PurchaseOrderDetailLineRow[]
  status: PurchaseOrderStatus
  statusLabel: string
  totalAmount: string
  totalQuantity: string
  vendor: VendorRef
  warehouse: WarehouseRef
}

const OPEN_STATUSES: ReadonlySet<PurchaseOrderStatus> = new Set(['DRAFT', 'APPROVED'])

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
    name: line.name,
    quantity: line.quantity.toLocaleString('ko-KR'),
    sku: line.sku,
    unit: line.unit,
    unitPrice: line.unitPrice.toLocaleString('ko-KR'),
  }
}

export function mapPurchaseOrderDetail(
  detail: PurchaseOrderDetailResponse,
): PurchaseOrderDetail {
  const isOpen = OPEN_STATUSES.has(detail.status)
  const delayed = isOpen && isOverdue(detail.desiredArrivalDate)
  const totalQuantity = detail.lines.reduce((sum, line) => sum + line.quantity, 0)

  return {
    approvedBy: detail.approvedBy,
    approvedByLabel: formatApprovedBy(detail.approvedBy),
    code: detail.code,
    createdAt: detail.createdAt,
    currency: detail.currency,
    dday: formatDday(detail.desiredArrivalDate),
    delayed,
    desiredArrivalDate: detail.desiredArrivalDate,
    lineCount: detail.lines.length,
    lines: detail.lines.map((line) => mapLine(line, detail.currency)),
    status: detail.status,
    statusLabel: PO_STATUS_LABELS[detail.status],
    totalAmount: formatAmount(detail.totalAmount, detail.currency),
    totalQuantity: totalQuantity.toLocaleString('ko-KR'),
    vendor: detail.vendor,
    warehouse: detail.warehouse,
  }
}
