import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  DEFAULT_ITEM_FILTER,
  getCreateItemErrorMessage,
  getItemSkuCheckErrorMessage,
  getUpdateItemErrorMessage,
  getMockBranchWarehouseCode,
  getMockItemStockRows,
  getMockVisibleItemStockRows,
  ItemCreateModal,
  ItemDetailModal,
  ItemFilterBar,
  ItemTable,
  itemDetailQueryKey,
  useCreateItemMutation,
  useItemCategoriesQuery,
  useItemDetailQuery,
  useItemSubCategoriesQuery,
  useItemSkuCheckMutation,
  useItemUnitsQuery,
  useItemsQuery,
  useUpdateItemMutation,
} from '@/features/item'
import type { Item, ItemDetailFormValues, ItemFilter, ItemFormValues, ItemListParams } from '@/features/item'
import { isErrorResponse, queryClient } from '@/shared/api'
import { useSession } from '@/shared/auth/session'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgEmptyState, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]
const ITEM_CREATE_ROLES = new Set(['ADMIN', 'HQ_MANAGER', 'HQ_STAFF'])
const ALL_WAREHOUSES = 'ALL'

export function ItemsPage() {
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [debouncedKeyword, setDebouncedKeyword] = useState(DEFAULT_ITEM_FILTER.keyword)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createMajorCategoryCode, setCreateMajorCategoryCode] = useState('')
  const [detailMajorCategoryCode, setDetailMajorCategoryCode] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<Item | null>(null)
  const [detailFormError, setDetailFormError] = useState<string | null>(null)
  const [detailWarehouseCode, setDetailWarehouseCode] = useState(ALL_WAREHOUSES)
  const { data: session } = useSession()
  const canCreateItem = ITEM_CREATE_ROLES.has(session?.userRole ?? '')

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
  const {
    data: createMiddleCategories = [],
    isFetching: isCreateMiddleCategoryFetching,
    isFetched: isCreateMiddleCategoryFetched,
    isLoading: isCreateMiddleCategoryLoading,
  } = useItemSubCategoriesQuery(createMajorCategoryCode || undefined)
  const {
    data: detailMiddleCategories = [],
    isFetching: isDetailMiddleCategoryFetching,
    isLoading: isDetailMiddleCategoryLoading,
  } = useItemSubCategoriesQuery(detailMajorCategoryCode || undefined)
  const {
    data: itemUnits = [],
    isFetching: isItemUnitsFetching,
    isLoading: isItemUnitsLoading,
  } = useItemUnitsQuery(canCreateItem)
  const { data, isFetching, isLoading } = useItemsQuery(itemListParams)
  const {
    data: itemDetail,
    error: itemDetailError,
    isLoading: isItemDetailLoading,
  } = useItemDetailQuery(detailTarget?.code ?? null)
  const createItemMutation = useCreateItemMutation()
  const skuCheckMutation = useItemSkuCheckMutation()
  const updateItemMutation = useUpdateItemMutation()

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
  const createMiddleCategoryOptions = useMemo(
    () =>
      createMiddleCategories.map((category) => ({
        label: category.categoryName,
        value: category.categoryCode,
      })),
    [createMiddleCategories],
  )
  const detailMiddleCategoryOptions = useMemo(
    () =>
      detailMiddleCategories.map((category) => ({
        label: category.categoryName,
        value: category.categoryCode,
      })),
    [detailMiddleCategories],
  )
  const unitOptions = useMemo(
    () =>
      itemUnits.map((itemUnit) => ({
        label: itemUnit.name,
        value: itemUnit.unit,
      })),
    [itemUnits],
  )
  const detailAllStockRows = useMemo(
    () => (detailTarget ? getMockItemStockRows(detailTarget.code) : []),
    [detailTarget],
  )
  const detailStockRows = useMemo(
    () =>
      detailTarget
        ? getMockVisibleItemStockRows({
            canManage: canCreateItem,
            sku: detailTarget.code,
            tenancyCode: session?.tenancyCode,
            warehouseCode: detailWarehouseCode,
          })
        : [],
    [canCreateItem, detailTarget, detailWarehouseCode, session?.tenancyCode],
  )
  const detailWarehouseOptions = useMemo(
    () => [
      { label: '전체 창고', value: ALL_WAREHOUSES },
      ...detailAllStockRows.map((row) => ({
        label: row.warehouseName,
        supportingText: row.warehouseCode,
        value: row.warehouseCode,
      })),
    ],
    [detailAllStockRows],
  )
  const detailStockScopeLabel = useMemo(() => {
    if (!detailTarget) {
      return undefined
    }

    if (canCreateItem) {
      if (detailWarehouseCode === ALL_WAREHOUSES) {
        return '전체 창고'
      }

      const selectedWarehouse = detailAllStockRows.find((row) => row.warehouseCode === detailWarehouseCode)
      return selectedWarehouse ? `${selectedWarehouse.warehouseName} 기준` : '선택 창고 기준'
    }

    const branchWarehouseCode = getMockBranchWarehouseCode(detailTarget.code, session?.tenancyCode)
    const branchWarehouse = detailAllStockRows.find((row) => row.warehouseCode === branchWarehouseCode)

    return branchWarehouse ? `${branchWarehouse.warehouseName} 기준` : '본인 지점 창고 기준'
  }, [canCreateItem, detailAllStockRows, detailTarget, detailWarehouseCode, session?.tenancyCode])
  const handleCreateMajorCategoryChange = useCallback((categoryCode: string) => {
    setCreateMajorCategoryCode(categoryCode)
  }, [])
  const handleSelectItem = useCallback((item: Item) => {
    setDetailTarget(item)
    setDetailFormError(null)
    setDetailWarehouseCode(ALL_WAREHOUSES)
  }, [])
  useEffect(() => {
    if (!detailTarget || !isErrorResponse(itemDetailError) || itemDetailError.status !== 404) {
      return
    }

    setDetailTarget(null)
    setDetailFormError(null)
    setDetailWarehouseCode(ALL_WAREHOUSES)
  }, [detailTarget, itemDetailError])
  const handleSkuCheck = useCallback(
    async (sku: string) => {
      try {
        return await skuCheckMutation.mutateAsync(sku)
      } catch (error) {
        throw new Error(getItemSkuCheckErrorMessage(error), { cause: error })
      }
    },
    [skuCheckMutation],
  )
  const handleCreateItem = useCallback(
    async (values: ItemFormValues) => {
      try {
        await createItemMutation.mutateAsync(values)
        await queryClient.invalidateQueries({ queryKey: ['items'] })
        setIsCreateModalOpen(false)
        toast.success('부품이 등록되었습니다.')
      } catch (error) {
        if (isErrorResponse(error)) {
          if (error.status !== 400 && error.status !== 409) {
            return
          }
        }

        toast.error(getCreateItemErrorMessage(error))
      }
    },
    [createItemMutation],
  )
  const handleUpdateItem = useCallback(
    async (values: ItemDetailFormValues) => {
      if (!itemDetail) {
        return
      }

      setDetailFormError(null)

      try {
        const updatedItem = await updateItemMutation.mutateAsync({
          sku: itemDetail.sku,
          values,
        })

        queryClient.setQueryData(itemDetailQueryKey(updatedItem.sku), updatedItem)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['items'] }),
          queryClient.invalidateQueries({ queryKey: itemDetailQueryKey(updatedItem.sku) }),
        ])
        toast.success('부품 정보가 수정되었습니다.')
      } catch (error) {
        if (!isErrorResponse(error)) {
          toast.error(getUpdateItemErrorMessage(error))
          throw error
        }

        if (error.errorCode === 'ITM-019') {
          await queryClient.invalidateQueries({ queryKey: ['items'] })
          setDetailTarget(null)
          setDetailFormError(null)
          setDetailMajorCategoryCode('')
          setDetailWarehouseCode(ALL_WAREHOUSES)
          throw error
        }

        if (error.errorCode === 'ITM-020') {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['items'] }),
            queryClient.invalidateQueries({ queryKey: itemDetailQueryKey(itemDetail.sku) }),
          ])
        }

        if (error.status === 400 || error.status === 409) {
          setDetailFormError(getUpdateItemErrorMessage(error))
        }

        throw error
      }
    },
    [itemDetail, updateItemMutation],
  )

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
      <FgPageHeader
        actions={
          canCreateItem ? (
            <FgButton
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              부품 추가
            </FgButton>
          ) : undefined
        }
        breadcrumbs={breadcrumbs}
        title="부품 마스터"
      />
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
      {canCreateItem && isCreateModalOpen ? (
        <ItemCreateModal
          isMajorCategoryLoading={isMajorCategoryLoading}
          isMiddleCategoryFetched={isCreateMiddleCategoryFetched}
          isMiddleCategoryLoading={isCreateMiddleCategoryLoading || isCreateMiddleCategoryFetching}
          isSubmitting={createItemMutation.isPending}
          isSkuChecking={skuCheckMutation.isPending}
          isUnitLoading={isItemUnitsLoading || isItemUnitsFetching}
          majorCategoryOptions={majorCategoryOptions}
          middleCategoryOptions={createMiddleCategoryOptions}
          open
          onClose={() => setIsCreateModalOpen(false)}
          onMajorCategoryChange={handleCreateMajorCategoryChange}
          onSkuCheck={handleSkuCheck}
          onSubmit={handleCreateItem}
          unitOptions={unitOptions}
        />
      ) : null}
      {detailTarget ? (
        <ItemDetailModal
          canManage={canCreateItem}
          detail={itemDetail ?? null}
          formError={detailFormError}
          isLoading={isItemDetailLoading}
          isSubCategoryLoading={isDetailMiddleCategoryLoading || isDetailMiddleCategoryFetching}
          isSubmitting={updateItemMutation.isPending}
          isUnitLoading={isItemUnitsLoading || isItemUnitsFetching}
          majorCategoryOptions={majorCategoryOptions}
          open
          stockRows={detailStockRows}
          stockScopeLabel={detailStockScopeLabel}
          subCategoryOptions={detailMiddleCategoryOptions}
          unitOptions={unitOptions}
          warehouseOptions={canCreateItem ? detailWarehouseOptions : undefined}
          warehouseValue={canCreateItem ? detailWarehouseCode : undefined}
          onClose={() => {
            setDetailTarget(null)
            setDetailFormError(null)
            setDetailMajorCategoryCode('')
            setDetailWarehouseCode(ALL_WAREHOUSES)
          }}
          onCategoryChange={setDetailMajorCategoryCode}
          onSubmit={handleUpdateItem}
          onWarehouseChange={canCreateItem ? setDetailWarehouseCode : undefined}
        />
      ) : null}
    </div>
  )
}
