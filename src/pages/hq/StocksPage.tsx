import { useNavigate, useSearch } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Plus, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_STOCK_FILTER,
  DEFAULT_STOCK_SORT,
  SafetyStockModal,
  StockAdjustModal,
  StockCreateModal,
  StockDetailPanel,
  StockFilterBar,
  StockKpiCards,
  StockTable,
  useSafetyStockEditQuery,
  useSafetyStockMutation,
  useStockAdjustMutation,
  useStockCreateMutation,
  useStockKpiQuery,
  useStockListQuery,
  useStockSkuDetailQuery,
} from '@/features/stock'
import type { AdjustmentFormValues, Stock, StockCreateFormValues, StockFilter, StockSort } from '@/features/stock'
import { useScopedWarehouseOptions } from '@/features/warehouse'
import { useSession } from '@/shared/auth/session'
import { formatNumber } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgButton, FgCard, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '물류 관리' }, { label: '재고' }, { label: '재고 조회' }]

/** 재고 조정·안전재고 조정 가능 역할. 재고 신규 생성은 ADMIN 전용으로 더 좁다. */
const MANAGER_ROLES = new Set(['ADMIN', 'HQ_MANAGER'])

export function StocksPage() {
  const navigate = useNavigate()

  // 대시보드 KPI 카드로 진입하면 초기 상태 필터(전체/부족)를 search 파라미터에서 받아 적용한다.
  const { status: statusParam } = useSearch({ strict: false }) as { status?: StockFilter['status'] }
  const [filter, setFilter] = useState<StockFilter>(() => ({
    ...DEFAULT_STOCK_FILTER,
    status: statusParam ?? DEFAULT_STOCK_FILTER.status,
  }))
  const [sort, setSort] = useState<StockSort>(DEFAULT_STOCK_SORT)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  // 첫 진입 시 우측 상세 패널은 비워둔다(선택 전).
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const sessionQuery = useSession()
  const userRole = sessionQuery.data?.userRole ?? ''
  const canManage = MANAGER_ROLES.has(userRole)
  const canCreate = userRole === 'ADMIN'

  // 창고 드롭다운 옵션: BRANCH는 자기 창고만, ADMIN·HQ는 전체(소속 기준 스코핑).
  const { branchLockedCode, branchLockedName, isBranch, options: warehouseOptions } = useScopedWarehouseOptions()
  // BRANCH는 창고 선택이 자기 창고로 고정된다(드롭다운 단일 옵션). ADMIN·HQ는 사용자가 고른 값을 그대로 쓴다.
  const effectiveWarehouseCode = isBranch
    ? (branchLockedCode ?? filter.warehouseCode)
    : filter.warehouseCode

  // 검색어는 300ms 디바운스. 창고·상태·정렬·페이지는 즉시 반영한다.
  const debouncedKeyword = useDebouncedValue(filter.keyword, 300)
  const listParams = useMemo(
    () => ({
      filter: { ...filter, keyword: debouncedKeyword, warehouseCode: effectiveWarehouseCode },
      page,
      size: pageSize,
      sort,
    }),
    [filter, debouncedKeyword, effectiveWarehouseCode, page, pageSize, sort],
  )

  const kpiQuery = useStockKpiQuery()
  const listQuery = useStockListQuery(listParams)
  const detailQuery = useStockSkuDetailQuery(selectedStock?.sku ?? null)
  const adjustMutation = useStockAdjustMutation()
  const createMutation = useStockCreateMutation()

  // 안전재고 프리필: 모달이 열린 동안 선택 행의 (창고, sku)로 현재 안전재고·version을 조회한다.
  const safetyTarget =
    safetyOpen && selectedStock
      ? { sku: selectedStock.sku, warehouseCode: selectedStock.warehouseCode }
      : null
  const safetyEditQuery = useSafetyStockEditQuery(safetyTarget)
  const safetyMutation = useSafetyStockMutation()

  const stocks = listQuery.data?.content ?? []
  const totalElements = listQuery.data?.totalElements ?? 0
  const totalPages = listQuery.data?.totalPages ?? 1
  const detail = detailQuery.data ?? null

  // 조정 모달의 창고 선택·현재고: 선택한 sku의 창고별 재고(상세 응답)에서 구성한다.
  const skuRows = useMemo<Stock[]>(() => {
    if (detail) {
      return detail.warehouse.map((warehouse) => ({
        id: warehouse.warehouseId,
        itemName: detail.itemName,
        itemUnit: detail.itemUnit,
        lastAdjustedAt: '',
        quantity: warehouse.quantity,
        safetyStock: warehouse.safetyStock,
        sku: detail.sku,
        status: warehouse.status,
        warehouseCode: warehouse.warehouseCode,
        warehouseId: warehouse.warehouseId,
        warehouseName: warehouse.warehouseName,
      }))
    }
    return selectedStock ? [selectedStock] : []
  }, [detail, selectedStock])

  function handleFilterChange(next: StockFilter) {
    setFilter(next)
    setPage(1)
  }

  // 비활성 창고·비활성 아이템 행은 상세 패널을 열지 않는다(IV-01: 조회만 가능, 수정 불가).
  function handleSelectStock(stock: Stock) {
    if (stock.warehouseActive === false || stock.itemActive === false) {
      toast.info('비활성 창고·부품의 상세는 표시되지 않습니다.')
      return
    }
    setSelectedStock(stock)
  }

  function handleAdjustSubmit(values: AdjustmentFormValues) {
    if (!selectedStock) return

    adjustMutation.mutate(
      { ...values, sku: selectedStock.sku },
      {
        onSuccess: () => {
          setAdjustOpen(false)
          toast.success('재고 조정이 저장되었습니다.')
        },
      },
    )
  }

  function handleSafetySubmit(safetyStock: number) {
    const edit = safetyEditQuery.data
    if (!edit) return

    safetyMutation.mutate(
      { safetyStock, sku: edit.sku, version: edit.version, warehouseCode: edit.warehouseCode },
      {
        onSuccess: () => {
          setSafetyOpen(false)
          toast.success('안전 재고가 수정되었습니다.')
        },
      },
    )
  }

  function handleCreateSubmit(values: StockCreateFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        setCreateOpen(false)
        toast.success('재고가 등록되었습니다.')
      },
    })
  }

  const rangeStart = totalElements === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalElements)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            {canManage ? (
              <>
                <FgButton
                  disabled={!selectedStock}
                  leftIcon={<ShieldCheck aria-hidden className="h-4 w-4" />}
                  onClick={() => setSafetyOpen(true)}
                >
                  안전 재고 조정
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
            ) : null}
            {canCreate ? (
              <FgButton
                leftIcon={<Plus aria-hidden className="h-4 w-4" />}
                variant="primary"
                onClick={() => setCreateOpen(true)}
              >
                재고 추가
              </FgButton>
            ) : null}
          </>
        }
        breadcrumbs={breadcrumbs}
        title="재고 조회"
      />
      {kpiQuery.data ? (
        <StockKpiCards
          kpi={kpiQuery.data}
          onRecentMovementsClick={() =>
            void navigate({
              to: '/stock-movements',
              search: {
                from: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
                to: dayjs().format('YYYY-MM-DD'),
              },
            })
          }
          onStatusSelect={(status) => handleFilterChange({ ...filter, status })}
        />
      ) : null}
      <StockFilterBar
        filter={{ ...filter, warehouseCode: effectiveWarehouseCode }}
        includeAllOption={!isBranch}
        lockedWarehouseName={branchLockedName}
        safetyRatioActive={sort.field === 'safetyRatio'}
        warehouses={warehouseOptions}
        onChange={handleFilterChange}
        onReset={() => {
          handleFilterChange(DEFAULT_STOCK_FILTER)
          setSort(DEFAULT_STOCK_SORT)
        }}
        onSafetyRatioSort={() => {
          setSort(DEFAULT_STOCK_SORT)
          setPage(1)
        }}
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
              sort={sort}
              stocks={stocks}
              onSelect={handleSelectStock}
              onSortChange={(next) => {
                setSort(next)
                setPage(1)
              }}
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
            canAdjust={canManage}
            detail={detail}
            loading={detailQuery.isLoading}
            onAdjust={() => setAdjustOpen(true)}
            onViewHistory={() =>
              void navigate({
                to: '/stock-movements',
                search: selectedStock ? { keyword: selectedStock.sku } : {},
              })
            }
          />
        </div>
      </div>
      <StockAdjustModal
        open={adjustOpen}
        skuRows={skuRows}
        stock={selectedStock}
        submitting={adjustMutation.isPending}
        onClose={() => setAdjustOpen(false)}
        onSubmit={handleAdjustSubmit}
      />
      <SafetyStockModal
        edit={safetyEditQuery.data ?? null}
        loading={safetyEditQuery.isLoading}
        open={safetyOpen}
        submitting={safetyMutation.isPending}
        onClose={() => setSafetyOpen(false)}
        onSubmit={handleSafetySubmit}
      />
      <StockCreateModal
        open={createOpen}
        submitting={createMutation.isPending}
        warehouses={warehouseOptions}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  )
}
