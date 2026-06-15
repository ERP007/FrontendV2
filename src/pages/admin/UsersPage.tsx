import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Copy, Download, KeyRound, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_USER_FILTER,
  getCreateUserErrorMessage,
  getUsersErrorMessage,
  UserCreateModal,
  UserFilterBar,
  UserTable,
  useCreateUserMutation,
  useUsersQuery,
  usersQueryKey,
} from '@/features/user'
import type {
  FetchUsersParams,
  UserFilter,
  UserFormValues,
  UserListItem,
  UserSortBy,
  UserSortDirection,
} from '@/features/user'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '관리' }, { label: '사용자' }, { label: '사용자 목록' }]
const SEARCH_DEBOUNCE_MS = 350
type ToastId = string | number

interface UserListSortState {
  direction: UserSortDirection
  key: UserSortBy
}

function hasTrailingHangulJamo(value: string) {
  return /[\u1100-\u11ff\u3131-\u318e]$/.test(value)
}

function nextEmpNo(users: UserListItem[]): string {
  const max = users.reduce((highest, user) => {
    const numeric = Number(user.employeeNo.replace(/\D/g, ''))
    return Number.isNaN(numeric) ? highest : Math.max(highest, numeric)
  }, 0)

  return `HMC${String(max + 1).padStart(4, '0')}`
}

function maskTemporaryPassword(password: string) {
  return '●'.repeat(Math.max(8, password.length))
}

function copyTextFallback(text: string) {
  const textarea = document.createElement('textarea')

  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')

  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('copy failed')
  }
}

async function copyTemporaryPassword(password: string, toastId: ToastId) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(password)
    } else {
      copyTextFallback(password)
    }

    toast.dismiss(toastId)
    toast.success('임시 비밀번호가 복사되었습니다.')
  } catch {
    toast.error('임시 비밀번호를 복사하지 못했습니다.')
  }
}

function showUserCreationResultToast(temporaryPassword: string) {
  const maskedPassword = maskTemporaryPassword(temporaryPassword)

  toast.custom(
    (toastId) => (
      <section className="w-80 rounded-card border border-line bg-surface p-4 shadow-popover">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-success-bg text-success">
            <CheckCircle2 aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-extrabold text-ink">사용자 등록 완료</p>
            <p className="mt-1 text-label text-muted">초기 비밀번호를 안전하게 전달해 주세요.</p>
          </div>
        </div>
        <div className="mt-4 rounded-control border border-line-soft bg-background px-3.5 py-3">
          <span className="flex items-center gap-1.5 text-meta font-semibold text-muted">
            <KeyRound aria-hidden className="h-3.5 w-3.5" />
            임시 비밀번호
          </span>
          <strong className="mt-1 block text-body tracking-widest text-ink">{maskedPassword}</strong>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <FgButton size="sm" onClick={() => toast.dismiss(toastId)}>
            닫기
          </FgButton>
          <FgButton
            leftIcon={<Copy aria-hidden className="h-4 w-4" />}
            size="sm"
            variant="primary"
            onClick={() => void copyTemporaryPassword(temporaryPassword, toastId)}
          >
            비밀번호 복사
          </FgButton>
        </div>
      </section>
    ),
    { duration: Infinity },
  )
}

export function UsersPage() {
  const [filter, setFilter] = useState<UserFilter>(DEFAULT_USER_FILTER)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<UserListSortState>({ direction: 'ASC', key: 'employeeNo' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const createUserMutation = useCreateUserMutation()

  useEffect(() => {
    const nextQuery = filter.keyword.trim()

    if (nextQuery === query || hasTrailingHangulJamo(nextQuery)) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setQuery(nextQuery)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [filter.keyword, query])

  const usersParams = useMemo<FetchUsersParams>(
    () => ({
      keyword: query,
      page,
      role: filter.role,
      size: pageSize,
      sortBy: sort.key,
      sortDirection: sort.direction,
      status: filter.status,
      tenancyCode: filter.tenancyCode,
    }),
    [filter.role, filter.status, filter.tenancyCode, page, pageSize, query, sort.direction, sort.key],
  )
  const usersQuery = useUsersQuery(usersParams)
  const users = usersQuery.data?.content ?? []
  const totalCount = usersQuery.data?.totalElements ?? 0
  const totalPages = Math.max(1, usersQuery.data?.totalPages ?? 1)
  const currentPage = Math.min(page, totalPages)
  const usersErrorMessage = usersQuery.isError ? getUsersErrorMessage(usersQuery.error) : null

  useEffect(() => {
    if (page > totalPages) {
      const timeoutId = window.setTimeout(() => {
        setPage(totalPages)
      }, 0)

      return () => window.clearTimeout(timeoutId)
    }
  }, [page, totalPages])

  function handleFilterChange(next: UserFilter) {
    setFilter(next)
    setPage(1)
  }

  function handleSortChange(sortBy: UserSortBy, sortDirection: UserSortDirection) {
    setSort({ direction: sortDirection, key: sortBy })
    setPage(1)
  }

  async function handleCreate(values: UserFormValues) {
    setCreateErrorMessage(null)

    try {
      const response = await createUserMutation.mutateAsync(values)

      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
      setCreateOpen(false)

      if (values.passwordMode === 'AUTO' && response.temporaryPassword) {
        showUserCreationResultToast(response.temporaryPassword)
        return
      }

      toast.success('사용자가 등록되었습니다. 첫 로그인 시 비밀번호 변경이 필요합니다.')
    } catch (error) {
      setCreateErrorMessage(getCreateUserErrorMessage(error))
    }
  }

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = totalCount === 0 ? 0 : Math.min(rangeStart + users.length - 1, totalCount)

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
              onClick={() => {
                setCreateErrorMessage(null)
                setCreateOpen(true)
              }}
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
        errorMessage={usersErrorMessage}
        header={
          <>
            <span>
              전체 <strong className="text-ink">{formatNumber(totalCount)}</strong>명 중 {rangeStart}–
              {rangeEnd}
            </span>
            <button
              className="inline-flex items-center gap-1.5 text-label font-semibold text-muted transition-colors hover:text-primary-strong"
              type="button"
              onClick={() => void usersQuery.refetch()}
            >
              <RefreshCw aria-hidden className="h-3.5 w-3.5" />
              새로고침
            </button>
          </>
        }
        loading={usersQuery.isLoading}
        sortBy={sort.key}
        sortDirection={sort.direction}
        users={users}
        onSortChange={handleSortChange}
      />
      <FgPagination
        page={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 30, 50]}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
      <UserCreateModal
        errorMessage={createErrorMessage}
        loading={createUserMutation.isPending}
        nextEmpNo={nextEmpNo(users)}
        open={createOpen}
        onClose={() => {
          setCreateErrorMessage(null)
          setCreateOpen(false)
        }}
        onSubmit={handleCreate}
      />
    </div>
  )
}
