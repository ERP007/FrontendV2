import { PackagePlus } from 'lucide-react'
import { useMemo } from 'react'

import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgModal, FgNotice } from '@/shared/ui'

import { useStockListQuery } from '../api/use-stock-list-query'
import { DEFAULT_STOCK_SORT } from '../model/types'
import type { Stock } from '../model/types'

import { StockStatusBadge } from './StockBadges'

/** 부족 재고 조회 크기. */
const MAX_PAGE_SIZE = 50

export interface LowStockOrderModalProps {
  onClose: () => void
  /** '발주 요청' 클릭 시 부족 재고 행 전체를 넘긴다. */
  onRequest: (stocks: Stock[]) => void
  open: boolean
  /** BRANCH는 자기 창고로 스코프. ALL이면 전체 부족 재고. */
  warehouseCode: string
}

export function LowStockOrderModal({ onClose, onRequest, open, warehouseCode }: LowStockOrderModalProps) {
  // status=LOW · size 최대로 부족 재고를 한 번에 조회한다(안전재고 대비 위험 순 정렬).
  const listQuery = useStockListQuery({
    filter: { includeInactive: false, keyword: '', status: 'LOW', warehouseCode },
    page: 1,
    size: MAX_PAGE_SIZE,
    sort: DEFAULT_STOCK_SORT,
  })

  const lowStocks = useMemo(() => listQuery.data?.content ?? [], [listQuery.data])
  const totalElements = listQuery.data?.totalElements ?? 0
  const isEmpty = !listQuery.isLoading && lowStocks.length === 0

  return (
    <FgModal
      description="안전재고에 못 미치는 부품 목록입니다. 발주 요청 시 부족 수량으로 채워진 구매 주문 등록 화면으로 이동합니다."
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-meta text-faint">부족 부품 {formatNumber(totalElements)}건</span>
          <span className="flex items-center gap-2">
            <FgButton onClick={onClose}>닫기</FgButton>
            <FgButton
              disabled={lowStocks.length === 0}
              leftIcon={<PackagePlus aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => onRequest(lowStocks)}
            >
              발주 요청
            </FgButton>
          </span>
        </div>
      }
      icon={<PackagePlus aria-hidden className="h-5 w-5 text-warning" />}
      open={open}
      size="lg"
      title="부족 부품 발주 요청"
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      {listQuery.isError ? (
        <FgNotice tone="danger">부족 재고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</FgNotice>
      ) : listQuery.isLoading ? (
        <p className="py-10 text-center text-muted">부족 재고를 불러오는 중…</p>
      ) : isEmpty ? (
        <FgNotice tone="success">부족한 부품이 없습니다.</FgNotice>
      ) : (
        <div className="overflow-hidden rounded-control border border-line">
          <table className="w-full text-label">
            <thead className="bg-background text-meta text-muted">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">부품코드</th>
                <th className="px-4 py-2.5 text-left font-medium">부품명</th>
                <th className="px-4 py-2.5 text-left font-medium">창고</th>
                <th className="px-4 py-2.5 text-right font-medium">현재고</th>
                <th className="px-4 py-2.5 text-right font-medium">안전재고</th>
                <th className="px-4 py-2.5 text-right font-medium">부족 수량</th>
                <th className="px-4 py-2.5 text-center font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {lowStocks.map((stock) => (
                <tr key={stock.id}>
                  <td className="px-4 py-2.5 font-semibold text-ink">{stock.sku}</td>
                  <td className="px-4 py-2.5 font-medium text-ink-2">{stock.itemName}</td>
                  <td className="px-4 py-2.5 text-muted">{stock.warehouseName}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-warning">{formatNumber(stock.quantity)}</td>
                  <td className="px-4 py-2.5 text-right text-muted">{formatNumber(stock.safetyStock)}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-ink">
                    {formatNumber(Math.max(stock.safetyStock - stock.quantity, 1))}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StockStatusBadge status={stock.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FgModal>
  )
}
