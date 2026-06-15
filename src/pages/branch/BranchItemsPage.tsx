import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  DEFAULT_ITEM_FILTER,
  getItemDetailErrorMessage,
  getMockBranchWarehouseCode,
  getMockItemStockRows,
  getMockVisibleItemStockRows,
  ItemDetailModal,
  ItemFilterBar,
  ItemTable,
  useItemCategoriesQuery,
  useItemDetailQuery,
  useItemSubCategoriesQuery,
  useItemsQuery,
  isItemNotFoundError,
} from '@/features/item'
import type { Item, ItemFilter, ItemListParams } from '@/features/item'
import { isErrorResponse } from '@/shared/api'
import { useSession } from '@/shared/auth/session'
import { formatNumber } from '@/shared/lib/format'
import { FgEmptyState, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]

export function BranchItemsPage() {
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [debouncedKeyword, setDebouncedKeyword] = useState(DEFAULT_ITEM_FILTER.keyword)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [detailTarget, setDetailTarget] = useState<Item | null>(null)
  const [detailFormError, setDetailFormError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(filter.keyword)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [filter.keyword])

  const itemListParams = useMemo<ItemListParams>(
    () => ({ ...filter, keyword: debouncedKeyword, page, size: pageSize }),
    [debouncedKeyword, filter, page, pageSize],
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
  const { data, isFetching, isLoading } = useItemsQuery(itemListParams)
  const {
    data: itemDetail,
    error: itemDetailError,
    isLoading: isItemDetailLoading,
  } = useItemDetailQuery(detailTarget?.code ?? null)

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
  const detailAllStockRows = useMemo(
    () => (detailTarget ? getMockItemStockRows(detailTarget.code) : []),
    [detailTarget],
  )
  const detailStockRows = useMemo(
    () =>
      detailTarget
        ? getMockVisibleItemStockRows({
            canManage: false,
            sku: detailTarget.code,
            tenancyCode: session?.tenancyCode,
          })
        : [],
    [detailTarget, session?.tenancyCode],
  )
  const detailStockScopeLabel = useMemo(() => {
    if (!detailTarget) {
      return undefined
    }

    const branchWarehouseCode = getMockBranchWarehouseCode(detailTarget.code, session?.tenancyCode)
    const branchWarehouse = detailAllStockRows.find((row) => row.warehouseCode === branchWarehouseCode)

    return branchWarehouse ? `${branchWarehouse.warehouseName} 기준` : '본인 지점 창고 기준'
  }, [detailAllStockRows, detailTarget, session?.tenancyCode])

  const handleSelectItem = useCallback((item: Item) => {
    setDetailTarget(item)
    setDetailFormError(null)
  }, [])
  useEffect(() => {
    if (!detailTarget || !isErrorResponse(itemDetailError)) {
      return
    }

    if (isItemNotFoundError(itemDetailError)) {
      setDetailTarget(null)
      setDetailFormError(null)
      return
    }

    if (itemDetailError.status === 400) {
      setDetailFormError(getItemDetailErrorMessage(itemDetailError))
    }
  }, [detailTarget, itemDetailError])

  const items = data?.content ?? []
  const totalCount = data?.totalElements ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)

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
          <span>
            {isFetching ? '새로고침 중 · ' : null}
            전체 <strong className="text-ink">{formatNumber(totalCount)}</strong>건 중 {rangeStart}-
            {rangeEnd}
          </span>
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
      {detailTarget ? (
        <ItemDetailModal
          canManage={false}
          detail={itemDetail ?? null}
          formError={detailFormError}
          isLoading={isItemDetailLoading}
          majorCategoryOptions={majorCategoryOptions}
          open
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
