import { useNavigate } from '@tanstack/react-router'
import { Download, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_STOCK_FILTER,
  StockDetailPanel,
  StockFilterBar,
  StockKpiCards,
  StockTable,
  useStockKpiQuery,
  useStockListQuery,
  useStockSkuDetailQuery,
} from '@/features/stock'
import type { Stock, StockFilter } from '@/features/stock'
import {
  DEFAULT_WAREHOUSE_FILTER,
  DEFAULT_WAREHOUSE_SORT,
  useWarehouseListQuery,
} from '@/features/warehouse'
import { formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgButton, FgCard, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '물류 관리' }, { label: '재고' }, { label: '재고 조회' }]

export function StocksPage() {
  const navigate = useNavigate()

  const [filter, setFilter] = useState<StockFilter>(DEFAULT_STOCK_FILTER)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  // 첫 진입 시 우측 상세 패널은 비워둔다(선택 전).
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  // 검색어는 300ms 디바운스. 창고·상태·정렬·페이지는 즉시 반영한다.
  const debouncedKeyword = useDebouncedValue(filter.keyword, 300)
  const listParams = useMemo(
    () => ({ filter: { ...filter, keyword: debouncedKeyword }, page, size: pageSize }),
    [filter, debouncedKeyword, page, pageSize],
  )

  const kpiQuery = useStockKpiQuery()
  const listQuery = useStockListQuery(listParams)
  const detailQuery = useStockSkuDetailQuery(selectedStock?.sku ?? null)
  // 창고 필터 옵션: 전체 창고 목록(서버 페이지네이션과 무관하게 전량 필요).
  const warehouseListQuery = useWarehouseListQuery({
    ...DEFAULT_WAREHOUSE_FILTER,
    sort: DEFAULT_WAREHOUSE_SORT,
  })

  const stocks = listQuery.data?.content ?? []
  const totalElements = listQuery.data?.totalElements ?? 0
  const totalPages = listQuery.data?.totalPages ?? 1
  const detail = detailQuery.data ?? null

  const warehouseOptions = useMemo(
    () =>
      (warehouseListQuery.data?.content ?? []).map((warehouse) => ({
        code: warehouse.code,
        name: warehouse.name,
      })),
    [warehouseListQuery.data],
  )

  function handleFilterChange(next: StockFilter) {
    setFilter(next)
    setPage(1)
  }

  function handleAdjust() {
    // 재고 조정은 커밋 분리를 위해 별도 단계에서 구현한다(이번은 조회만).
    toast.info('재고 조정은 다음 단계에서 제공됩니다.')
  }

  const rangeStart = totalElements === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalElements)

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
              onClick={handleAdjust}
            >
              재고 조정
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="재고 조회"
      />
      {kpiQuery.data ? (
        <StockKpiCards
          kpi={kpiQuery.data}
          onStatusSelect={(status) => handleFilterChange({ ...filter, status })}
        />
      ) : null}
      <StockFilterBar
        filter={filter}
        warehouses={warehouseOptions}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_STOCK_FILTER)}
      />
      <div className="flex items-start gap-5">
        <div className="min-w-0 flex-1 space-y-5">
          {listQuery.isError ? (
            <FgCard className="p-6 text-center text-muted">
              재고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </FgCard>
          ) : (
            <StockTable
              header={
                <span>
                  전체 <strong className="text-ink">{formatNumber(totalElements)}</strong>건
                  {totalElements > 0 ? ` 중 ${rangeStart}–${rangeEnd}` : ''}
                </span>
              }
              selectedId={selectedStock?.id ?? null}
              stocks={stocks}
              onSelect={(stock) => setSelectedStock(stock)}
            />
          )}
          <FgPagination
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[20, 50, 100]}
            totalCount={totalElements}
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
            loading={detailQuery.isLoading}
            onAdjust={handleAdjust}
            onViewHistory={() => void navigate({ to: '/stock-movements' })}
          />
        </div>
      </div>
    </div>
  )
}
