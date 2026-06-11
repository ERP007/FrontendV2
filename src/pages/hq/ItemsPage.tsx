import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_ITEM_FILTER,
  filterItems,
  ITEM_FIXTURES,
  ItemCreateModal,
  ItemFilterBar,
  ItemTable,
} from '@/features/item'
import type { Item, ItemFilter, ItemFormValues } from '@/features/item'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '마스터' }, { label: '부품 마스터' }]

function nextItemCode(items: Item[]): string {
  return `HMC-NW-${String(items.length + 1).padStart(5, '0')}`
}

export function ItemsPage() {
  const [items, setItems] = useState<Item[]>(ITEM_FIXTURES)
  const [filter, setFilter] = useState<ItemFilter>(DEFAULT_ITEM_FILTER)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => filterItems(items, filter), [items, filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleFilterChange(next: ItemFilter) {
    setFilter(next)
    setPage(1)
  }

  function handleCreate(values: ItemFormValues) {
    if (items.some((item) => item.code === values.code)) {
      toast.error('이미 존재하는 부품 코드입니다.')
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    setItems((previous) => [
      ...previous,
      {
        active: true,
        code: values.code,
        createdAt: today,
        defaultSafetyStock: values.defaultSafetyStock,
        description: values.description || null,
        id: Math.max(...previous.map((item) => item.id)) + 1,
        majorCategory: values.majorCategory,
        middleCategory: values.middleCategory,
        name: values.name,
        unit: values.unit,
        updatedAt: today,
      },
    ])
    setCreateOpen(false)
    toast.success('부품이 등록되었습니다.')
  }

  function handleToggleActive(target: Item) {
    setItems((previous) =>
      previous.map((item) =>
        item.id === target.id
          ? { ...item, active: !item.active, updatedAt: new Date().toISOString().slice(0, 10) }
          : item,
      ),
    )
    toast.success(target.active ? '부품이 비활성 전환되었습니다.' : '부품이 활성 전환되었습니다.')
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <FgButton
            leftIcon={<Plus aria-hidden className="h-4 w-4" />}
            variant="primary"
            onClick={() => setCreateOpen(true)}
          >
            부품 추가
          </FgButton>
        }
        breadcrumbs={breadcrumbs}
        title="부품 마스터"
      />
      <ItemFilterBar
        filter={filter}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_ITEM_FILTER)}
      />
      <ItemTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(filtered.length)}</strong>건 중 {rangeStart}–
            {rangeEnd}
          </span>
        }
        items={pageRows}
        onToggleActive={handleToggleActive}
      />
      <FgPagination
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
      <ItemCreateModal
        nextCode={nextItemCode(items)}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
