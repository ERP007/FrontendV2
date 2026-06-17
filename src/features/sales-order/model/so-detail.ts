import { SO_STATUS_LABELS } from './so-ui-model'
import type { BranchSalesOrderDetailResponse, SalesOrderLineResponse } from './types'

// 라인 화면 모델. 단위 미확정이면 '—' 로 표시한다.
export interface BranchSalesOrderDetailLine extends Omit<SalesOrderLineResponse, 'unit'> {
  unit: string
}

// 지점 발주 상세 화면 모델 (SO #10). 상태 한글 라벨을 미리 계산해 둔다.
export interface BranchSalesOrderDetail
  extends Omit<BranchSalesOrderDetailResponse, 'lines'> {
  lines: BranchSalesOrderDetailLine[]
  statusLabel: string
}

function mapLine(line: SalesOrderLineResponse): BranchSalesOrderDetailLine {
  return {
    ...line,
    unit: line.unit ?? '—',
  }
}

export function mapBranchSalesOrderDetail(
  detail: BranchSalesOrderDetailResponse,
): BranchSalesOrderDetail {
  return {
    ...detail,
    lines: detail.lines.map(mapLine),
    statusLabel: SO_STATUS_LABELS[detail.status],
  }
}
