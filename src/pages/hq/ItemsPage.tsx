import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  DEFAULT_ITEM_FILTER,
  getItemErrorDetail,
  getMockBranchWarehouseCode,
  getMockItemStockRows,
  getMockVisibleItemStockRows,
  ItemCreateModal,
  ItemDetailModal,
  ItemFilterBar,
  ItemTable,
  itemDetailQueryKey,
  useActivateItemMutation,
  useCreateItemMutation,
  useDeactivateItemMutation,
  useItemCategoriesQuery,
  useItemDetailQuery,
  useItemSubCategoriesQuery,
  useItemSkuCheckMutation,
  useItemUnitsQuery,
  useItemsQuery,
  useUpdateItemMutation,
  isItemErrorCode,
} from '@/features/item'
import type { Item, ItemDetail, ItemDetailFormValues, ItemFilter, ItemFormValues, ItemListParams } from '@/features/item'
import { isErrorResponse, queryClient } from '@/shared/api'
import { useSession } from '@/shared/auth/session'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgEmptyState, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]
const ITEM_CREATE_ROLES = new Set(['ADMIN', 'HQ_MANAGER', 'HQ_STAFF'])
const ALL_WAREHOUSES = 'ALL'
const CREATE_ITEM_ERROR_FALLBACK = '부품 등록 중 오류가 발생했습니다.'
const ITEM_DETAIL_ERROR_FALLBACK = '부품 상세 조회 중 오류가 발생했습니다.'
const UPDATE_ITEM_ERROR_FALLBACK = '부품 수정 중 오류가 발생했습니다.'
const ITEM_STATUS_CHANGE_ERROR_FALLBACK = '부품 상태 변경 중 오류가 발생했습니다.'

export function ItemsPage() {
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [debouncedKeyword, setDebouncedKeyword] = useState(DEFAULT_ITEM_FILTER.keyword)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createMajorCategoryCode, setCreateMajorCategoryCode] = useState('')
  const [detailMajorCategoryCode, setDetailMajorCategoryCode] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormError, setCreateFormError] = useState<string | null>(null)
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
  const activateItemMutation = useActivateItemMutation()
  const deactivateItemMutation = useDeactivateItemMutation()

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
  const handleSkuCheck = useCallback(
    (sku: string) => skuCheckMutation.mutateAsync(sku),
    [skuCheckMutation],
  )
  const handleCreateItem = useCallback(
    async (values: ItemFormValues) => {
      setCreateFormError(null)

      try {
        await createItemMutation.mutateAsync(values)
        await queryClient.invalidateQueries({ queryKey: ['items'] })
        setIsCreateModalOpen(false)
        setCreateFormError(null)
        toast.success('부품이 등록되었습니다.')
      } catch (error) {
        if (!isErrorResponse(error)) {
          toast.error(getItemErrorDetail(error, CREATE_ITEM_ERROR_FALLBACK))
          return
        }

        if (error.status === 400 || error.status === 409) {
          setCreateFormError(getItemErrorDetail(error, CREATE_ITEM_ERROR_FALLBACK))
        }
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
          toast.error(getItemErrorDetail(error, UPDATE_ITEM_ERROR_FALLBACK))
          throw error
        }

        if (error.status === 404 || isItemErrorCode(error, 'ITM-019')) {
          await queryClient.invalidateQueries({ queryKey: ['items'] })
          setDetailTarget(null)
          setDetailFormError(null)
          setDetailMajorCategoryCode('')
          setDetailWarehouseCode(ALL_WAREHOUSES)
          throw error
        }

        if (isItemErrorCode(error, 'ITM-020')) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['items'] }),
            queryClient.invalidateQueries({ queryKey: itemDetailQueryKey(itemDetail.sku) }),
          ])
        }

        if (error.status === 400 || error.status === 409) {
          setDetailFormError(getItemErrorDetail(error, UPDATE_ITEM_ERROR_FALLBACK))
        }

        throw error
      }
    },
    [itemDetail, updateItemMutation],
  )
  const handleToggleItemActive = useCallback(
    async (detail: ItemDetail) => {
      setDetailFormError(null)

      try {
        if (detail.active) {
          await deactivateItemMutation.mutateAsync(detail.sku)
        } else {
          await activateItemMutation.mutateAsync(detail.sku)
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['items'] }),
          queryClient.invalidateQueries({ queryKey: itemDetailQueryKey(detail.sku) }),
        ])
        toast.success(detail.active ? '부품이 비활성화되었습니다.' : '부품이 활성화되었습니다.')
      } catch (error) {
        if (!isErrorResponse(error)) {
          toast.error(getItemErrorDetail(error, ITEM_STATUS_CHANGE_ERROR_FALLBACK))
          return
        }

        if (error.status === 404 || isItemErrorCode(error, 'ITM-019')) {
          await queryClient.invalidateQueries({ queryKey: ['items'] })
          setDetailTarget(null)
          setDetailFormError(null)
          setDetailMajorCategoryCode('')
          setDetailWarehouseCode(ALL_WAREHOUSES)
          return
        }

        if (isItemErrorCode(error, 'ITM-017') || isItemErrorCode(error, 'ITM-020')) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['items'] }),
            queryClient.invalidateQueries({ queryKey: itemDetailQueryKey(detail.sku) }),
          ])
        }

        if (error.status === 400 || error.status === 409) {
          toast.error(getItemErrorDetail(error, ITEM_STATUS_CHANGE_ERROR_FALLBACK))
        }
      }
    },
    [activateItemMutation, deactivateItemMutation],
  )

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
      <FgPageHeader
        actions={
          canCreateItem ? (
            <FgButton
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => {
                setCreateFormError(null)
                setIsCreateModalOpen(true)
              }}
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
      {canCreateItem && isCreateModalOpen ? (
        <ItemCreateModal
          formError={createFormError}
          isMajorCategoryLoading={isMajorCategoryLoading}
          isMiddleCategoryFetched={isCreateMiddleCategoryFetched}
          isMiddleCategoryLoading={isCreateMiddleCategoryLoading || isCreateMiddleCategoryFetching}
          isSubmitting={createItemMutation.isPending}
          isSkuChecking={skuCheckMutation.isPending}
          isUnitLoading={isItemUnitsLoading || isItemUnitsFetching}
          majorCategoryOptions={majorCategoryOptions}
          middleCategoryOptions={createMiddleCategoryOptions}
          open
          onClose={() => {
            setIsCreateModalOpen(false)
            setCreateFormError(null)
          }}
          onMajorCategoryChange={handleCreateMajorCategoryChange}
          onSkuCheck={handleSkuCheck}
          onSubmit={handleCreateItem}
          unitOptions={unitOptions}
        />
      ) : null}
      {detailTarget && !isDetailUnavailable ? (
        <ItemDetailModal
          canManage={canCreateItem}
          detail={itemDetail ?? null}
          formError={visibleDetailFormError}
          isLoading={isItemDetailLoading}
          isStatusChanging={activateItemMutation.isPending || deactivateItemMutation.isPending}
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
          onToggleActive={handleToggleItemActive}
          onWarehouseChange={canCreateItem ? setDetailWarehouseCode : undefined}
        />
      ) : null}
    </div>
  )
}
