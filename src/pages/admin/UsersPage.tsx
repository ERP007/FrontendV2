import { Download, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_USER_FILTER,
  filterUsers,
  USER_FIXTURES,
  UserCreateModal,
  UserFilterBar,
  UserTable,
} from '@/features/user'
import type { User, UserFilter, UserFormValues } from '@/features/user'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '관리' }, { label: '사용자' }, { label: '사용자 목록' }]

function nextEmpNo(users: User[]): string {
  const max = users.reduce((highest, user) => {
    const numeric = Number(user.empNo.replace(/\D/g, ''))
    return Number.isNaN(numeric) ? highest : Math.max(highest, numeric)
  }, 0)

  return `HMC${String(max + 1).padStart(4, '0')}`
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(USER_FIXTURES)
  const [filter, setFilter] = useState<UserFilter>(DEFAULT_USER_FILTER)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)

  const filtered = useMemo(() => filterUsers(users, filter), [users, filter])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function handleFilterChange(next: UserFilter) {
    setFilter(next)
    setPage(1)
  }

  function handleCreate(values: UserFormValues) {
    if (users.some((user) => user.empNo === values.empNo)) {
      toast.error('이미 존재하는 사번입니다.')
      return
    }

    setUsers((previous) => [
      ...previous,
      {
        email: values.email,
        empNo: values.empNo,
        id: Math.max(...previous.map((user) => user.id)) + 1,
        joinedAt: new Date().toISOString().slice(0, 10),
        name: values.name,
        rank: values.rank || null,
        role: values.role,
        status: 'PENDING',
        warehouseName: values.warehouseName,
      },
    ])
    setCreateOpen(false)
    toast.success('사용자가 등록되었습니다. 첫 로그인 시 비밀번호 변경이 필요합니다.')
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, filtered.length)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
            <FgButton
              leftIcon={<Download aria-hidden className="h-4 w-4" />}
              onClick={() => toast.info('내보내기는 백엔드 연동 후 제공됩니다.')}
            >
              내보내기
            </FgButton>
            <FgButton
              leftIcon={<Plus aria-hidden className="h-4 w-4" />}
              variant="primary"
              onClick={() => setCreateOpen(true)}
            >
              사용자 추가
            </FgButton>
          </>
        }
        breadcrumbs={breadcrumbs}
        title="사용자 목록"
      />
      <UserFilterBar
        filter={filter}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_USER_FILTER)}
      />
      <UserTable
        header={
          <span>
            전체 <strong className="text-ink">{formatNumber(filtered.length)}</strong>명 중 {rangeStart}–
            {rangeEnd}
          </span>
        }
        users={pageRows}
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
      <UserCreateModal
        nextEmpNo={nextEmpNo(users)}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
