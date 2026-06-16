import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  DEFAULT_ITEM_FILTER,
  getItemErrorDetail,
  getItemStockErrorDetail,
  ItemDetailModal,
  ItemFilterBar,
  ItemTable,
  useItemCategoriesQuery,
  useItemDetailQuery,
  useItemStocksQuery,
  useItemSubCategoriesQuery,
  useItemsQuery,
  isItemErrorCode,
} from '@/features/item'
import type { Item, ItemFilter } from '@/features/item'
import { isErrorResponse } from '@/shared/api'
import { formatNumber } from '@/shared/lib/format'
import { FgEmptyState, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]
const ITEM_DETAIL_ERROR_FALLBACK = '부품 상세 조회 중 오류가 발생했습니다.'

export function BranchItemsPage() {
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [debouncedKeyword, setDebouncedKeyword] = useState(DEFAULT_ITEM_FILTER.keyword)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailTarget, setDetailTarget] = useState<Item | null>(null)
  const [detailFormError, setDetailFormError] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(filter.keyword)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [filter.keyword])

  const itemListFilter = useMemo<ItemFilter>(
    () => ({ ...filter, keyword: debouncedKeyword }),
    [debouncedKeyword, filter],
  )
  const selectedMajorCategoryCode = filter.majorCategory === 'ALL' ? undefined : filter.majorCategory
  const {
    data: majorCategories = [],
    isLoading: isMajorCategoryLoading,
  } = useItemCategoriesQuery()
  const {
    data: middleCategories = [],
    isFetching: isMiddleCategoryFetching,
    isLoading: isMiddleCategoryLoading,
  } = useItemSubCategoriesQuery(selectedMajorCategoryCode)
  const { data, isFetching, isLoading } = useItemsQuery(itemListFilter, page, pageSize)
  const {
    data: itemDetail,
    error: itemDetailError,
    isLoading: isItemDetailLoading,
  } = useItemDetailQuery(detailTarget?.code ?? null)
  const {
    data: detailStockRows = [],
    error: detailStockError,
    isLoading: isDetailStockLoading,
  } = useItemStocksQuery(detailTarget?.code ?? null)

  const majorCategoryOptions = useMemo(
    () =>
      majorCategories.map((category) => ({
        label: category.categoryName,
        value: category.categoryCode,
      })),
    [majorCategories],
  )
  const middleCategoryOptions = useMemo(
    () =>
      middleCategories.map((category) => ({
        label: category.categoryName,
        value: category.categoryCode,
      })),
    [middleCategories],
  )
  const detailStockScopeLabel = useMemo(() => {
    if (!detailTarget) {
      return undefined
    }

    const branchWarehouse = detailStockRows[0]

    return branchWarehouse ? `${branchWarehouse.warehouseName} 기준` : '본인 지점 창고 기준'
  }, [detailStockRows, detailTarget])
  const detailStockErrorMessage = detailStockError ? getItemStockErrorDetail(detailStockError) : null

  const handleSelectItem = useCallback((item: Item) => {
    setDetailTarget(item)
    setDetailFormError(null)
  }, [])
  const itemDetailResponseError = isErrorResponse(itemDetailError) ? itemDetailError : null
  const isDetailUnavailable = Boolean(
    detailTarget &&
      itemDetailResponseError &&
      (itemDetailResponseError.status === 404 || isItemErrorCode(itemDetailResponseError, 'ITM-019')),
  )
  const detailFetchFormError =
    detailTarget && itemDetailResponseError?.status === 400
      ? getItemErrorDetail(itemDetailResponseError, ITEM_DETAIL_ERROR_FALLBACK)
      : null
  const visibleDetailFormError = detailFormError ?? detailFetchFormError

  const items = data?.content ?? []
  const totalCount = data?.totalElements ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const isListUpdating = isFetching && !isLoading

  function handleFilterChange(next: ItemFilter) {
    const isOnlyKeywordChanged =
      next.keyword !== filter.keyword &&
      next.majorCategory === filter.majorCategory &&
      next.middleCategory === filter.middleCategory &&
      next.sort === filter.sort &&
      next.status === filter.status

    setFilter(next)
    if (!isOnlyKeywordChanged) {
      setPage(1)
    }
  }

  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min((page - 1) * pageSize + items.length, totalCount)

  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs} title="부품 마스터" />
      <ItemFilterBar
        filter={filter}
        isMajorCategoryLoading={isMajorCategoryLoading}
        isMiddleCategoryLoading={isMiddleCategoryLoading || isMiddleCategoryFetching}
        majorCategoryOptions={majorCategoryOptions}
        middleCategoryOptions={middleCategoryOptions}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_ITEM_FILTER)}
      />
      <ItemTable
        emptyState={
          isLoading ? (
            <FgEmptyState
              description="잠시만 기다려 주세요"
              icon={<Loader2 aria-hidden className="h-6 w-6 animate-spin" />}
              title="부품을 불러오는 중입니다"
            />
          ) : undefined
        }
        header={
          <div className="flex w-full items-center justify-between gap-3">
            <span>
              전체 <strong className="text-ink">{formatNumber(totalCount)}</strong>건 중 {rangeStart}-
              {rangeEnd}
            </span>
            {isListUpdating ? (
              <span
                aria-live="polite"
                className="inline-flex items-center gap-1.5 text-label font-semibold text-primary"
                role="status"
              >
                <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
                목록 업데이트 중
              </span>
            ) : null}
          </div>
        }
        items={items}
        onSelect={handleSelectItem}
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
      {detailTarget && !isDetailUnavailable ? (
        <ItemDetailModal
          canManage={false}
          detail={itemDetail ?? null}
          formError={visibleDetailFormError}
          isLoading={isItemDetailLoading}
          isStockLoading={isDetailStockLoading}
          majorCategoryOptions={majorCategoryOptions}
          open
          stockEmptyDescription="본인 지점 창고에 등록된 재고가 없습니다"
          stockErrorMessage={detailStockErrorMessage}
          stockRows={detailStockRows}
          stockScopeLabel={detailStockScopeLabel}
          subCategoryOptions={middleCategoryOptions}
          unitOptions={[]}
          onClose={() => {
            setDetailTarget(null)
            setDetailFormError(null)
          }}
        />
      ) : null}
    </div>
  )
}
