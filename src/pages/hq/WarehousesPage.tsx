import { Building2, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  BRANCH_LOCATION_FIXTURES,
  BranchCreateModal,
  DEFAULT_WAREHOUSE_FILTER,
  filterWarehouses,
  WAREHOUSE_FIXTURES,
  WarehouseFilterBar,
  WarehouseFormModal,
  WarehouseTable,
} from '@/features/warehouse'
import type { BranchLocation, Warehouse, WarehouseFilter, WarehouseFormValues } from '@/features/warehouse'
import { FgButton, FgPageHeader } from '@/shared/ui'

export function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(WAREHOUSE_FIXTURES)
  const [branches, setBranches] = useState<BranchLocation[]>(BRANCH_LOCATION_FIXTURES)
  const [filter, setFilter] = useState<WarehouseFilter>(DEFAULT_WAREHOUSE_FILTER)
  const [createOpen, setCreateOpen] = useState(false)
  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Warehouse | null>(null)

  const visibleWarehouses = useMemo(() => filterWarehouses(warehouses, filter), [warehouses, filter])

  function handleCreate(values: WarehouseFormValues) {
    if (warehouses.some((warehouse) => warehouse.code === values.code)) {
      toast.error('이미 존재하는 창고 코드입니다.')
      return
    }

    const now = new Date().toISOString()
    const branchName = branches.find((branch) => branch.id === values.branchId)?.name ?? null

    setWarehouses((previous) => [
      ...previous,
      {
        active: true,
        address: values.address,
        branchId: values.branchId,
        branchName,
        code: values.code,
        createdAt: now,
        id: Math.max(...previous.map((warehouse) => warehouse.id)) + 1,
        name: values.name,
        type: values.type,
        updatedAt: now,
        version: 0,
      },
    ])
    setCreateOpen(false)
    toast.success('창고가 등록되었습니다.')
  }

  function handleUpdate(values: WarehouseFormValues) {
    if (!editTarget) return

    const branchName = branches.find((branch) => branch.id === values.branchId)?.name ?? null

    setWarehouses((previous) =>
      previous.map((warehouse) =>
        warehouse.id === editTarget.id
          ? {
              ...warehouse,
              address: values.address,
              branchId: values.branchId,
              branchName,
              name: values.name,
              type: values.type,
              updatedAt: new Date().toISOString(),
              version: warehouse.version + 1,
            }
          : warehouse,
      ),
    )
    setEditTarget(null)
    toast.success('창고 정보가 수정되었습니다.')
  }

  function handleToggleActive(target: Warehouse) {
    setWarehouses((previous) =>
      previous.map((warehouse) =>
        warehouse.id === target.id
          ? {
              ...warehouse,
              active: !warehouse.active,
              updatedAt: new Date().toISOString(),
              version: warehouse.version + 1,
            }
          : warehouse,
      ),
    )
    toast.success(target.active ? '창고가 비활성 전환되었습니다.' : '창고가 활성 전환되었습니다.')
  }

  function handleCreateBranch(name: string) {
    if (branches.some((branch) => branch.name === name)) {
      toast.error('이미 존재하는 지점명입니다.')
      return
    }

    setBranches((previous) => [
      ...previous,
      { id: Math.max(...previous.map((branch) => branch.id)) + 1, name },
    ])
    setBranchModalOpen(false)
    toast.success('지점이 등록되었습니다.')
  }

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              leftIcon={<Building2 aria-hidden className="h-4 w-4" />}
              variant="soft"
              onClick={() => setBranchModalOpen(true)}
            >
              지점 추가
            </FgButton>
            <FgButton
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
      <WarehouseTable
        warehouses={visibleWarehouses}
        onEdit={setEditTarget}
        onToggleActive={handleToggleActive}
      />
      <WarehouseFormModal
        branches={branches}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <WarehouseFormModal
        branches={branches}
        initial={editTarget}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
      />
      <BranchCreateModal
        open={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        onSubmit={handleCreateBranch}
      />
    </div>
  )
}
