import { useSearch } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  createDefaultMovementFilter,
  DEFAULT_MOVEMENT_SORT,
  MovementFilterBar,
  MovementTable,
  useMovementListQuery,
} from '@/features/stock'
import type { MovementFilter, MovementSort, MovementSortField } from '@/features/stock'
import { useScopedWarehouseOptions } from '@/features/warehouse'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgNotice, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '물류 관리' }, { label: '재고' }, { label: '재고 이력' }]

/** 조회 기간 상한(일). 초과 시 시작일을 자동 보정한다(응답 크기·백엔드 제한, IV-03). */
const MAX_RANGE_DAYS = 365

export function StockMovementsPage() {
  // 재고 조회 상세 패널에서 sku(keyword)를, KPI '최근 7일 이동' 클릭에서 기간(from/to)을 넘겨받는다(모두 선택적).
  const {
    from: fromParam,
    keyword: keywordParam,
    to: toParam,
  } = useSearch({ strict: false }) as { from?: string; keyword?: string; to?: string }
  const [filter, setFilter] = useState<MovementFilter>(() => {
    const base = createDefaultMovementFilter()
    return {
      ...base,
      // 기간이 넘어오면 기본값(30일) 대신 그 기간으로 시작한다(KPI 최근 7일 이동 진입).
      from: fromParam ?? base.from,
      keyword: keywordParam ?? '',
      to: toParam ?? base.to,
    }
  })
  const [sort, setSort] = useState<MovementSort>(DEFAULT_MOVEMENT_SORT)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // 검색어만 300ms 디바운스. 창고·유형·기간·정렬 변경은 즉시 재조회한다(IV-03 규약).
  const debouncedKeyword = useDebouncedValue(filter.keyword, 300)

  // 시작일이 종료일보다 늦으면 조회를 막고 인라인 경고를 띄운다(IV-03 경계 케이스).
  const rangeInvalid = Boolean(filter.from && filter.to && dayjs(filter.from).isAfter(filter.to, 'day'))

  // 창고 드롭다운 옵션: BRANCH는 자기 창고만, ADMIN·HQ는 전체(소속 기준 스코핑).
  const { branchLockedCode, isBranch, options: warehouseOptions } = useScopedWarehouseOptions()
  // BRANCH는 창고 선택이 자기 창고로 고정된다(드롭다운 단일 옵션). ADMIN·HQ는 사용자가 고른 값을 그대로 쓴다.
  const effectiveWarehouseCode = isBranch
    ? (branchLockedCode ?? filter.warehouseCode)
    : filter.warehouseCode

  const listParams = useMemo(
    () => ({
      enabled: !rangeInvalid,
      filter: { ...filter, keyword: debouncedKeyword, warehouseCode: effectiveWarehouseCode },
      page,
      size: pageSize,
      sort,
    }),
    [filter, debouncedKeyword, effectiveWarehouseCode, page, pageSize, sort, rangeInvalid],
  )

  const listQuery = useMovementListQuery(listParams)

  const movements = listQuery.data?.content ?? []
  const totalElements = listQuery.data?.totalElements ?? 0
  const totalPages = listQuery.data?.totalPages ?? 1

  // 기간이 상한을 넘으면 시작일을 당겨 자동 보정하고 안내한다.
  function clampRange(next: MovementFilter): MovementFilter {
    if (next.from && next.to && dayjs(next.to).diff(next.from, 'day') > MAX_RANGE_DAYS) {
      toast.warning(`조회 기간은 최대 ${MAX_RANGE_DAYS}일입니다. 시작일을 보정했습니다.`)
      return { ...next, from: dayjs(next.to).subtract(MAX_RANGE_DAYS, 'day').format('YYYY-MM-DD') }
    }
    return next
  }

  function handleFilterChange(next: MovementFilter) {
    setFilter(clampRange(next))
    setPage(1)
  }

  // 같은 컬럼 재클릭은 방향 토글, 다른 컬럼은 내림차순부터 시작한다.
  function handleSortChange(field: MovementSortField) {
    setSort((prev) =>
      prev.field === field
        ? { direction: prev.direction === 'asc' ? 'desc' : 'asc', field }
        : { direction: 'desc', field },
    )
    setPage(1)
  }

  return (
    <div className="fg-content">
      <FgPageHeader breadcrumbs={breadcrumbs} title="재고 이력" />
      <MovementFilterBar
        filter={{ ...filter, warehouseCode: effectiveWarehouseCode }}
        includeAllOption={!isBranch}
        warehouses={warehouseOptions}
        onChange={handleFilterChange}
        onReset={() => {
          setFilter(createDefaultMovementFilter())
          setSort(DEFAULT_MOVEMENT_SORT)
          setPage(1)
        }}
      />
      {rangeInvalid ? (
        <FgNotice tone="danger">시작일이 종료일보다 늦을 수 없습니다. 기간을 다시 선택해 주세요.</FgNotice>
      ) : null}
      <MovementTable
        error={listQuery.isError}
        loading={listQuery.isLoading}
        movements={movements}
        periodLabel={`${filter.from} ~ ${filter.to}`}
        sort={sort}
        totalCount={totalElements}
        onRefresh={() => void listQuery.refetch()}
        onSortChange={handleSortChange}
      />
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
  )
}
