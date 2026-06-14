import { Building2, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  BranchCreateModal,
  DEFAULT_WAREHOUSE_FILTER,
  DEFAULT_WAREHOUSE_SORT,
  useBranchLocationCreateMutation,
  useBranchLocationsQuery,
  useWarehouseActiveMutation,
  useWarehouseCreateMutation,
  useWarehouseDetailQuery,
  useWarehouseListQuery,
  useWarehouseUpdateMutation,
  WarehouseFilterBar,
  WarehouseFormModal,
  WarehouseTable,
} from '@/features/warehouse'
import type {
  WarehouseFilter,
  WarehouseFormValues,
  WarehouseListItem,
  WarehouseSort,
} from '@/features/warehouse'
import { useSession } from '@/shared/auth/session'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { FgButton, FgCard, FgPageHeader } from '@/shared/ui'

/** 창고/지점 추가·수정·활성전환을 수행할 수 있는 역할(백엔드 인가와 동일). */
const MANAGER_ROLES = new Set(['ADMIN', 'HQ_MANAGER'])

export function WarehousesPage() {
  const [filter, setFilter] = useState<WarehouseFilter>(DEFAULT_WAREHOUSE_FILTER)
  const [sort, setSort] = useState<WarehouseSort>(DEFAULT_WAREHOUSE_SORT)
  const [createOpen, setCreateOpen] = useState(false)
  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [editCode, setEditCode] = useState<string | null>(null)

  const sessionQuery = useSession()
  const canManage = MANAGER_ROLES.has(sessionQuery.data?.userRole ?? '')

  // 검색어는 300ms 디바운스해 입력마다 서버를 호출하지 않는다. 유형·상태·정렬은 즉시 반영.
  const debouncedKeyword = useDebouncedValue(filter.keyword, 300)
  const listQuery = useWarehouseListQuery({
    keyword: debouncedKeyword,
    sort,
    status: filter.status,
    type: filter.type,
  })

  // 지점 드롭다운은 창고 추가/수정 폼에서만 필요 → 폼이 열릴 때만 조회한다(진입 시 불필요한 호출 방지).
  const branchesQuery = useBranchLocationsQuery(createOpen || editCode !== null)
  // 수정 프리필: 목록에 없는 branchId·address·version까지 상세 조회로 채운다.
  const detailQuery = useWarehouseDetailQuery(editCode)

  const createMutation = useWarehouseCreateMutation()
  const updateMutation = useWarehouseUpdateMutation()
  const activeMutation = useWarehouseActiveMutation()
  const branchCreateMutation = useBranchLocationCreateMutation()

  const warehouses = listQuery.data?.content ?? []
  const totalElements = listQuery.data?.totalElements ?? warehouses.length
  const branches = branchesQuery.data ?? []

  const editInitial =
    detailQuery.data && detailQuery.data.code === editCode ? detailQuery.data : null

  function handleCreate(values: WarehouseFormValues) {
    createMutation.mutate(values, {
      onSuccess: () => {
        setCreateOpen(false)
        toast.success('창고가 등록되었습니다.')
      },
    })
  }

  function handleUpdate(values: WarehouseFormValues) {
    if (!editCode || !editInitial) return

    updateMutation.mutate(
      { code: editCode, values, version: editInitial.version },
      {
        onSuccess: () => {
          setEditCode(null)
          toast.success('창고 정보가 수정되었습니다.')
        },
      },
    )
  }

  function handleToggleActive(target: WarehouseListItem) {
    activeMutation.mutate(
      { active: !target.active, code: target.code },
      {
        onSuccess: () => {
          toast.success(
            target.active ? '창고가 비활성 전환되었습니다.' : '창고가 활성 전환되었습니다.',
          )
        },
      },
    )
  }

  function handleCreateBranch(name: string) {
    // 지점명 중복(409 등) 검증은 서버가 담당하며 실패는 전역 에러 토스트로 노출된다.
    branchCreateMutation.mutate(name, {
      onSuccess: () => {
        setBranchModalOpen(false)
        toast.success('지점이 등록되었습니다.')
      },
    })
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              disabled={!canManage}
              leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
              variant="soft"
              onClick={() => setBranchModalOpen(true)}
            >
              지점 추가
            </FgButton>
            <FgButton
              disabled={!canManage}
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => setCreateOpen(true)}
            >
              창고 추가
            </FgButton>
          </>
        }
        breadcrumbs={[{ label: '마스터' }, { label: '창고 관리' }]}
        title="창고 관리"
      />
      <WarehouseFilterBar
        filter={filter}
        onChange={setFilter}
        onReset={() => setFilter(DEFAULT_WAREHOUSE_FILTER)}
      />
      {listQuery.isError ? (
        <FgCard className="p-6 text-center text-muted">
          창고 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </FgCard>
      ) : listQuery.isLoading ? (
        <FgCard className="p-6 text-center text-muted">창고 목록을 불러오는 중…</FgCard>
      ) : (
        <WarehouseTable
          canManage={canManage}
          sort={sort}
          total={totalElements}
          warehouses={warehouses}
          onEdit={(warehouse) => setEditCode(warehouse.code)}
          onSortChange={setSort}
          onToggleActive={handleToggleActive}
        />
      )}
      <WarehouseFormModal
        branches={branches}
        open={createOpen}
        submitting={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <WarehouseFormModal
        branches={branches}
        initial={editInitial}
        open={editInitial !== null}
        submitting={updateMutation.isPending}
        onClose={() => setEditCode(null)}
        onSubmit={handleUpdate}
      />
      <BranchCreateModal
        open={branchModalOpen}
        submitting={branchCreateMutation.isPending}
        onClose={() => setBranchModalOpen(false)}
        onSubmit={handleCreateBranch}
      />
    </div>
  )
}
