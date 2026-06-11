import { useNavigate } from '@tanstack/react-router'
import { Download, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  buildStockSkuDetail,
  DEFAULT_STOCK_FILTER,
  deriveStockKpi,
  filterStocks,
  MOVEMENT_FIXTURES,
  previewAdjustedQuantity,
  resolveStockStatus,
  STOCK_FIXTURES,
  StockAdjustModal,
  StockDetailPanel,
  StockFilterBar,
  StockKpiCards,
  StockTable,
} from '@/features/stock'
import type { AdjustmentFormValues, Movement, Stock, StockFilter } from '@/features/stock'
import { MOCK_SESSION } from '@/shared/config/session'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '물류 관리' }, { label: '재고' }, { label: '재고 조회' }]

export function StocksPage() {
  const navigate = useNavigate()

  const [stocks, setStocks] = useState<Stock[]>(STOCK_FIXTURES)
  const [movements, setMovements] = useState<Movement[]>(MOVEMENT_FIXTURES)
  const [filter, setFilter] = useState<StockFilter>(DEFAULT_STOCK_FILTER)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [selectedId, setSelectedId] = useState<number | null>(STOCK_FIXTURES[0]?.id ?? null)
  const [adjustOpen, setAdjustOpen] = useState(false)

  const kpi = useMemo(() => deriveStockKpi(stocks, movements), [stocks, movements])
  const filtered = useMemo(() => filterStocks(stocks, filter), [stocks, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  const selectedStock = stocks.find((stock) => stock.id === selectedId) ?? null
  const detail = useMemo(
    () => (selectedStock ? buildStockSkuDetail(selectedStock.sku, stocks, movements) : null),
    [selectedStock, stocks, movements],
  )
  const skuRows = selectedStock ? stocks.filter((stock) => stock.sku === selectedStock.sku) : []

  const warehouseOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const stock of stocks) {
      if (!seen.has(stock.warehouseCode)) seen.set(stock.warehouseCode, stock.warehouseName)
    }
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }))
  }, [stocks])

  function handleFilterChange(next: StockFilter) {
    setFilter(next)
    setPage(1)
  }

  function handleAdjustSubmit(values: AdjustmentFormValues) {
    const targetRow = stocks.find(
      (stock) => stock.sku === selectedStock?.sku && stock.warehouseCode === values.warehouseCode,
    )
    if (!targetRow) return

    const expected = previewAdjustedQuantity(targetRow.quantity, values.adjustmentType, values.quantity)
    const delta = expected - targetRow.quantity
    const now = new Date().toISOString()

    setStocks((previous) =>
      previous.map((stock) =>
        stock.id === targetRow.id
          ? {
              ...stock,
              lastAdjustedAt: now,
              quantity: expected,
              status: resolveStockStatus(expected, stock.safetyStock),
            }
          : stock,
      ),
    )
    setMovements((previous) => [
      {
        delta,
        executorEmpNo: MOCK_SESSION.empNo,
        executorName: MOCK_SESSION.name,
        id: Math.max(...previous.map((movement) => movement.id)) + 1,
        itemName: targetRow.itemName,
        occurredAt: now,
        reason: values.reason,
        sku: targetRow.sku,
        sourceRef: `ADJ-2026-${String(Math.max(...previous.map((movement) => movement.id)) + 1).padStart(4, '0')}`,
        type: values.adjustmentType,
        unit: targetRow.itemUnit,
        warehouseCode: targetRow.warehouseCode,
        warehouseName: targetRow.warehouseName,
      },
      ...previous,
    ])
    setAdjustOpen(false)
    toast.success('재고 조정이 저장되었습니다.')
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              leftIcon={<Download aria-hidden className="h-4 w-4" />}
              onClick={() => toast.info('내보내기는 백엔드 연동 후 제공됩니다.')}
            >
              내보내기
            </FgButton>
            <FgButton
              disabled={!selectedStock}
              leftIcon={<SlidersHorizontal aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => setAdjustOpen(true)}
            >
              재고 조정
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="재고 조회"
      />
      <StockKpiCards kpi={kpi} />
      <StockFilterBar
        filter={filter}
        warehouses={warehouseOptions}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_STOCK_FILTER)}
      />
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          <StockTable
            header={
              <span>
                전체 <strong className="text-ink">{formatNumber(filtered.length)}</strong>건 중 {rangeStart}–
                {rangeEnd}
              </span>
            }
            selectedId={selectedId}
            stocks={pageRows}
            onSelect={(stock) => setSelectedId(stock.id)}
          />
          <FgPagination
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[20, 50, 100]}
            totalCount={filtered.length}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        </div>
        <div className="w-96 shrink-0">
          <StockDetailPanel
            detail={detail}
            onAdjust={() => setAdjustOpen(true)}
            onViewHistory={() => void navigate({ to: '/stock-movements' })}
          />
        </div>
      </div>
      <StockAdjustModal
        open={adjustOpen}
        skuRows={skuRows}
        stock={selectedStock}
        onClose={() => setAdjustOpen(false)}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  )
}
