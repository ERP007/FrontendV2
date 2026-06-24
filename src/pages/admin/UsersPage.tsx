import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Copy, KeyRound, Plus, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  DEFAULT_USER_FILTER,
  getCreateUserErrorMessage,
  getResetPasswordErrorMessage,
  getToggleUserSuspensionErrorMessage,
  getUpdateUserErrorMessage,
  getUserDetailErrorMessage,
  getUserTenancyOptionsErrorMessage,
  getUsersErrorMessage,
  USER_TENANCY_OPTIONS,
  UserCreateModal,
  UserDetailModal,
  UserFilterBar,
  UserPasswordResetModal,
  UserSuspendToggleModal,
  UserTable,
  useCreateUserMutation,
  useResetUserPasswordMutation,
  useToggleUserSuspensionMutation,
  useUpdateUserMutation,
  useUserDetailQuery,
  useUserTenancyOptionsQuery,
  useUsersQuery,
  userDetailQueryKeys,
  usersQueryKey,
} from '@/features/user'
import type {
  FetchUsersParams,
  UserDetailFormValues,
  UserFilter,
  UserFormValues,
  UserListItem,
  UserSortBy,
  UserSortDirection,
} from '@/features/user'
import { useSession } from '@/shared/auth/session'
import { formatNumber } from '@/shared/lib/format'
import { FgButton, FgPageHeader, FgPagination } from '@/shared/ui'

const breadcrumbs = [{ label: '관리' }, { label: '사용자' }, { label: '사용자 목록' }]
const SEARCH_DEBOUNCE_MS = 350
const EMPTY_USER_LIST: UserListItem[] = []
type ToastId = string | number

interface UserListSortState {
  direction: UserSortDirection
  key: UserSortBy
}

interface TemporaryPasswordToastOptions {
  message: string
  temporaryPassword: string
  title: string
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

const USER_SORT_COLLATOR = new Intl.Collator('ko-KR', {
  numeric: true,
  sensitivity: 'base',
})

function compareDateString(left: string, right: string) {
  const leftTime = Date.parse(left)
  const rightTime = Date.parse(right)

  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime)) {
    return leftTime - rightTime
  }

  return USER_SORT_COLLATOR.compare(left, right)
}

function compareUsersBySort(left: UserListItem, right: UserListItem, sort: UserListSortState) {
  if (sort.key === 'joinedAt') {
    return compareDateString(left.joinedAt, right.joinedAt)
  }

  if (sort.key === 'name') {
    return USER_SORT_COLLATOR.compare(left.name, right.name)
  }

  return USER_SORT_COLLATOR.compare(left.employeeNo, right.employeeNo)
}

function sortUserList(users: UserListItem[], sort: UserListSortState) {
  const direction = sort.direction === 'ASC' ? 1 : -1

  return [...users].sort((left, right) => {
    const result = compareUsersBySort(left, right, sort)

    if (result !== 0) {
      return result * direction
    }

    return USER_SORT_COLLATOR.compare(left.employeeNo, right.employeeNo)
  })
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

function showTemporaryPasswordToast({ message, temporaryPassword, title }: TemporaryPasswordToastOptions) {
  const maskedPassword = maskTemporaryPassword(temporaryPassword)

  toast.custom(
    (toastId) => (
      <section className="w-80 rounded-card border border-line bg-surface p-4 shadow-popover">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-success-bg text-success">
            <CheckCircle2 aria-hidden className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-body font-extrabold text-ink">{title}</p>
            <p className="mt-1 text-label text-muted">{message}</p>
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

function showUserCreationResultToast(temporaryPassword: string) {
  showTemporaryPasswordToast({
    message: '초기 비밀번호를 안전하게 전달해 주세요.',
    temporaryPassword,
    title: '사용자 등록 완료',
  })
}

export function UsersPage() {
  const [filter, setFilter] = useState<UserFilter>(DEFAULT_USER_FILTER)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<UserListSortState>({ direction: 'ASC', key: 'employeeNo' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [resetPasswordTarget, setResetPasswordTarget] = useState<UserListItem | null>(null)
  const [resetPasswordErrorMessage, setResetPasswordErrorMessage] = useState<string | null>(null)
  const [suspendToggleTarget, setSuspendToggleTarget] = useState<UserListItem | null>(null)
  const [suspendToggleErrorMessage, setSuspendToggleErrorMessage] = useState<string | null>(null)
  const [detailTarget, setDetailTarget] = useState<UserListItem | null>(null)
  const [detailSaveErrorMessage, setDetailSaveErrorMessage] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const createUserMutation = useCreateUserMutation()
  const resetUserPasswordMutation = useResetUserPasswordMutation()
  const toggleUserSuspensionMutation = useToggleUserSuspensionMutation()
  const updateUserMutation = useUpdateUserMutation()
  const userTenancyOptionsQuery = useUserTenancyOptionsQuery()

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
  const users = usersQuery.data?.content ?? EMPTY_USER_LIST
  const sortedUsers = useMemo(() => sortUserList(users, sort), [sort, users])
  const totalCount = usersQuery.data?.totalElements ?? 0
  const totalPages = Math.max(1, usersQuery.data?.totalPages ?? 1)
  const currentPage = Math.min(page, totalPages)
  const usersErrorMessage = usersQuery.isError ? getUsersErrorMessage(usersQuery.error) : null
  const userDetailQuery = useUserDetailQuery(detailTarget?.userId, detailTarget !== null)
  const detailErrorMessage = userDetailQuery.isError
    ? getUserDetailErrorMessage(userDetailQuery.error)
    : null
  const selectedUserDetail =
    userDetailQuery.data?.userId === detailTarget?.userId ? userDetailQuery.data : undefined
  const freshUserDetail = userDetailQuery.isFetching ? undefined : selectedUserDetail
  const tenancyOptions = userTenancyOptionsQuery.data ?? USER_TENANCY_OPTIONS
  const tenancyOptionsErrorMessage = userTenancyOptionsQuery.isError
    ? getUserTenancyOptionsErrorMessage(userTenancyOptionsQuery.error)
    : null

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

  function openResetPasswordModal(user: UserListItem) {
    setResetPasswordErrorMessage(null)
    setResetPasswordTarget(user)
  }

  function closeResetPasswordModal() {
    if (resetUserPasswordMutation.isPending) {
      return
    }

    setResetPasswordErrorMessage(null)
    setResetPasswordTarget(null)
  }

  async function handleResetPasswordConfirm() {
    if (!resetPasswordTarget) {
      return
    }

    setResetPasswordErrorMessage(null)

    try {
      const response = await resetUserPasswordMutation.mutateAsync(resetPasswordTarget.userId)

      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
      setResetPasswordTarget(null)

      if (response.temporaryPassword) {
        showTemporaryPasswordToast({
          message: '새 임시 비밀번호를 안전하게 전달해 주세요.',
          temporaryPassword: response.temporaryPassword,
          title: '비밀번호 초기화 완료',
        })
        return
      }

      toast.success('비밀번호가 초기화되었습니다.')
    } catch (error) {
      setResetPasswordErrorMessage(getResetPasswordErrorMessage(error))
    }
  }

  function openSuspendToggleModal(user: UserListItem) {
    setSuspendToggleErrorMessage(null)
    setSuspendToggleTarget(user)
  }

  function closeSuspendToggleModal() {
    if (toggleUserSuspensionMutation.isPending) {
      return
    }

    setSuspendToggleErrorMessage(null)
    setSuspendToggleTarget(null)
  }

  async function handleSuspendToggleConfirm() {
    if (!suspendToggleTarget) {
      return
    }

    setSuspendToggleErrorMessage(null)

    try {
      const response = await toggleUserSuspensionMutation.mutateAsync({
        suspended: suspendToggleTarget.status !== 'SUSPENDED',
        userId: suspendToggleTarget.userId,
      })

      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
      setSuspendToggleTarget(null)

      toast.success(response.status === 'SUSPENDED' ? '사용자가 정지되었습니다.' : '사용자 정지가 해제되었습니다.')
    } catch (error) {
      const errorMessage = getToggleUserSuspensionErrorMessage(error)

      setSuspendToggleErrorMessage(errorMessage)
      toast.error(errorMessage)
    }
  }

  function openUserDetailModal(user: UserListItem) {
    setDetailSaveErrorMessage(null)
    setDetailTarget(user)
  }

  function closeUserDetailModal() {
    if (updateUserMutation.isPending) {
      return
    }

    setDetailSaveErrorMessage(null)
    setDetailTarget(null)
  }

  async function handleUserDetailSubmit(values: UserDetailFormValues) {
    if (!detailTarget) {
      return
    }

    setDetailSaveErrorMessage(null)

    try {
      const selectedTenancyName = tenancyOptions.find((option) => option.code === values.tenancyCode)?.label
      const currentTenancyName =
        userDetailQuery.data?.tenancyCode === values.tenancyCode ? userDetailQuery.data.tenancyName : ''
      const tenancyName =
        selectedTenancyName && selectedTenancyName !== values.tenancyCode
          ? selectedTenancyName
          : currentTenancyName || selectedTenancyName || values.tenancyCode

      const response = await updateUserMutation.mutateAsync({
        payload: {
          display_name: values.name.trim(),
          email: values.email.trim(),
          position: values.position.trim(),
          role: values.role,
          tenancy_code: values.tenancyCode,
          tenancy_name: tenancyName,
        },
        userId: detailTarget.userId,
      })

      queryClient.setQueryData(userDetailQueryKeys.detail(detailTarget.userId), response)
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
      setDetailTarget(null)
      toast.success('사용자 정보가 저장되었습니다.')
    } catch (error) {
      setDetailSaveErrorMessage(getUpdateUserErrorMessage(error))
    }
  }

  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = totalCount === 0 ? 0 : Math.min(rangeStart + sortedUsers.length - 1, totalCount)

  return (
    <div className="fg-content">
      <FgPageHeader
        actions={
          <>
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
        tenancyOptions={tenancyOptions}
        onChange={handleFilterChange}
        onReset={() => handleFilterChange(DEFAULT_USER_FILTER)}
      />
      <UserTable
        currentEmployeeNo={session?.employeeNo}
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
        users={sortedUsers}
        onEditUser={openUserDetailModal}
        onResetPassword={openResetPasswordModal}
        onSortChange={handleSortChange}
        onToggleSuspension={openSuspendToggleModal}
      />
      <FgPagination
        layout="totalLeft"
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
        tenancyOptions={tenancyOptions}
        tenancyOptionsErrorMessage={tenancyOptionsErrorMessage}
        tenancyOptionsLoading={userTenancyOptionsQuery.isLoading}
        onClose={() => {
          setCreateErrorMessage(null)
          setCreateOpen(false)
        }}
        onSubmit={handleCreate}
      />
      <UserDetailModal
        detail={freshUserDetail}
        errorMessage={detailErrorMessage}
        loading={userDetailQuery.isFetching}
        open={detailTarget !== null}
        saveErrorMessage={detailSaveErrorMessage}
        saving={updateUserMutation.isPending}
        tenancyOptions={tenancyOptions}
        tenancyOptionsErrorMessage={tenancyOptionsErrorMessage}
        tenancyOptionsLoading={userTenancyOptionsQuery.isLoading}
        user={detailTarget}
        onClose={closeUserDetailModal}
        onRetry={() => void userDetailQuery.refetch()}
        onSubmit={handleUserDetailSubmit}
      />
      <UserPasswordResetModal
        errorMessage={resetPasswordErrorMessage}
        loading={resetUserPasswordMutation.isPending}
        open={resetPasswordTarget !== null}
        user={resetPasswordTarget}
        onClose={closeResetPasswordModal}
        onConfirm={handleResetPasswordConfirm}
      />
      <UserSuspendToggleModal
        errorMessage={suspendToggleErrorMessage}
        loading={toggleUserSuspensionMutation.isPending}
        open={suspendToggleTarget !== null}
        user={suspendToggleTarget}
        onClose={closeSuspendToggleModal}
        onConfirm={handleSuspendToggleConfirm}
      />
    </div>
  )
}
