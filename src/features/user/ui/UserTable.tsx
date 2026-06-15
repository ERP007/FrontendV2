import { KeyRound, Pencil, UserX } from 'lucide-react'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'

import { formatDate } from '@/shared/lib/format'
import { FgAvatar, FgDataTable, FgDropdownMenu, FgEmptyState, FgStatusBadge } from '@/shared/ui'

import type { UserListItem, UserSortBy, UserSortDirection } from '../model/types'

export interface UserTableProps {
  currentEmployeeNo?: string
  errorMessage?: string | null
  header?: ReactNode
  loading?: boolean
  onSortChange?: (sortBy: UserSortBy, sortDirection: UserSortDirection) => void
  sortBy?: UserSortBy
  sortDirection?: UserSortDirection
  users: UserListItem[]
}

const sortableColumns = new Set<UserSortBy>(['employeeNo', 'name', 'joinedAt'])

function isUserSortBy(value: string): value is UserSortBy {
  return sortableColumns.has(value as UserSortBy)
}

function normalizeEmployeeNo(value: string) {
  return value.trim().toUpperCase()
}

export function UserTable({
  currentEmployeeNo,
  errorMessage,
  header,
  loading = false,
  onSortChange,
  sortBy,
  sortDirection,
  users,
}: UserTableProps) {
  const sorting = sortBy ? [{ desc: sortDirection === 'DESC', id: sortBy }] : []
  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: 'employeeNo',
        cell: ({ row }) => <span className="font-semibold text-ink">{row.original.employeeNo.toUpperCase()}</span>,
        enableSorting: true,
        header: '사번',
        size: 110,
      },
      {
        accessorKey: 'name',
        cell: ({ row }) => {
          const isSelf =
            currentEmployeeNo &&
            normalizeEmployeeNo(row.original.employeeNo) === normalizeEmployeeNo(currentEmployeeNo)

          return (
            <span className="flex items-center gap-2.5">
              <FgAvatar size="sm" />
              <span className="font-semibold text-ink">{row.original.name}</span>
              {isSelf ? (
                <span className="rounded-pill bg-primary-soft px-2 py-0.5 text-micro text-primary-strong">
                  본인
                </span>
              ) : null}
            </span>
          )
        },
        enableSorting: true,
        header: '이름',
        size: 160,
      },
      {
        accessorKey: 'email',
        cell: ({ row }) => <span className="font-medium text-muted">{row.original.email}</span>,
        header: '이메일',
      },
      {
        accessorKey: 'department',
        cell: ({ row }) => <span className="font-medium text-ink-2">{row.original.department}</span>,
        header: '소속',
        size: 140,
      },
      {
        accessorKey: 'role',
        cell: ({ row }) => (
          <span className="text-table font-semibold tracking-wide text-ink-2">{row.original.role}</span>
        ),
        header: 'Role',
        size: 170,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => <FgStatusBadge status={row.original.status} />,
        header: '상태',
        size: 130,
      },
      {
        accessorKey: 'joinedAt',
        cell: ({ row }) => <span className="font-medium text-muted">{formatDate(row.original.joinedAt)}</span>,
        enableSorting: true,
        header: '가입일',
        size: 110,
      },
      {
        cell: () => (
          <FgDropdownMenu
            items={[
              { icon: <Pencil aria-hidden className="h-4 w-4" />, label: '정보 수정' },
              { icon: <KeyRound aria-hidden className="h-4 w-4" />, label: '비밀번호 초기화' },
              { danger: true, icon: <UserX aria-hidden className="h-4 w-4" />, label: '계정 정지' },
            ]}
          />
        ),
        header: '액션',
        id: 'actions',
        meta: { align: 'center' },
        size: 70,
      },
    ],
    [currentEmployeeNo],
  )

  const emptyState = errorMessage ? (
    <FgEmptyState
      description={errorMessage}
      title="사용자 목록을 불러오지 못했습니다"
    />
  ) : loading ? (
    <FgEmptyState title="사용자 목록을 불러오는 중입니다" description="잠시만 기다려 주세요" />
  ) : (
    <FgEmptyState title="조건에 맞는 사용자가 없습니다" description="검색어 또는 필터를 변경해 보세요" />
  )

  return (
    <FgDataTable
      columns={columns}
      data={loading && users.length === 0 ? [] : users}
      emptyState={emptyState}
      enableSortingRemoval={false}
      header={header}
      manualSorting
      sorting={sorting}
      onSortingChange={(nextSorting) => {
        const next = nextSorting[0]

        if (!next || !isUserSortBy(next.id)) {
          return
        }

        onSortChange?.(next.id, next.desc ? 'DESC' : 'ASC')
      }}
    />
  )
}
