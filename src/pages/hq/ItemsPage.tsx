import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  DEFAULT_ITEM_FILTER,
  getCreateItemErrorMessage,
  getItemSkuCheckErrorMessage,
  ItemCreateModal,
  ItemDetailModal,
  ItemFilterBar,
  ItemTable,
  toItemDetailPreview,
  useCreateItemMutation,
  useItemCategoriesQuery,
  useItemSubCategoriesQuery,
  useItemSkuCheckMutation,
  useItemUnitsQuery,
  useItemsQuery,
} from '@/features/item'
import type { Item, ItemFilter, ItemFormValues, ItemListParams } from '@/features/item'
import { isErrorResponse, queryClient } from '@/shared/api'
import { useSession } from '@/shared/auth/session'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgEmptyState, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]
const ITEM_CREATE_ROLES = new Set(['ADMIN', 'HQ_MANAGER', 'HQ_STAFF'])

export function ItemsPage() {
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [debouncedKeyword, setDebouncedKeyword] = useState(DEFAULT_ITEM_FILTER.keyword)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createMajorCategoryCode, setCreateMajorCategoryCode] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<Item | null>(null)
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
    data: itemUnits = [],
    isFetching: isItemUnitsFetching,
    isLoading: isItemUnitsLoading,
  } = useItemUnitsQuery(canCreateItem)
  const { data, isFetching, isLoading } = useItemsQuery(itemListParams)
  const createItemMutation = useCreateItemMutation()
  const skuCheckMutation = useItemSkuCheckMutation()

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
  const unitOptions = useMemo(
    () =>
      itemUnits.map((itemUnit) => ({
        label: itemUnit.name,
        value: itemUnit.unit,
      })),
    [itemUnits],
  )
  const detail = useMemo(
    () => (detailTarget ? toItemDetailPreview(detailTarget) : null),
    [detailTarget],
  )
  const handleCreateMajorCategoryChange = useCallback((categoryCode: string) => {
    setCreateMajorCategoryCode(categoryCode)
  }, [])
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
        onSelect={setDetailTarget}
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
          detail={detail}
          isUnitLoading={isItemUnitsLoading || isItemUnitsFetching}
          majorCategoryOptions={majorCategoryOptions}
          open
          stockRows={[]}
          stockScopeLabel={canCreateItem ? '전체 창고' : '본인 지점 창고 기준'}
          subCategoryOptions={middleCategoryOptions}
          unitOptions={unitOptions}
          onClose={() => setDetailTarget(null)}
        />
      ) : null}
    </div>
  )
}
