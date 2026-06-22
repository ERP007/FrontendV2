import { RotateCcw, Search } from 'lucide-react'
import { useMemo } from 'react'

import { roleLabel } from '@/shared/config/session'
import { FgButton, FgCard, FgInput, FgSelect } from '@/shared/ui'

import type { UserApiRole, UserFilter, UserRoleFilter, UserStatus, UserTenancyCodeFilter } from '../model/types'
import type { UserTenancyOption } from '../model/user-tenancy'

const roleValues: UserApiRole[] = [
  'ADMIN',
  'HQ_MANAGER',
  'HQ_STAFF',
  'BRANCH_MANAGER',
  'BRANCH_STAFF',
  'WAREHOUSE_MANAGER',
  'WAREHOUSE_STAFF',
]

const roleOptions = [
  { label: 'Role : 전체', value: 'ALL' },
  ...roleValues.map((role) => ({
    label: `${role} · ${roleLabel(role)}`,
    value: role,
  })),
]

const statusOptions = [
  { label: '상태 : 전체', value: 'ALL' },
  { label: 'ACTIVE · 활성', value: 'ACTIVE' },
  { label: 'PENDING · 대기', value: 'PENDING' },
  { label: 'SUSPENDED · 정지', value: 'SUSPENDED' },
]

export interface UserFilterBarProps {
  filter: UserFilter
  onChange: (filter: UserFilter) => void
  onReset: () => void
  tenancyOptions: UserTenancyOption[]
}

export function UserFilterBar({ filter, onChange, onReset, tenancyOptions }: UserFilterBarProps) {
  const belongOptions = useMemo(
    () => [
      { label: '소속 : 전체', value: 'ALL' },
      ...tenancyOptions.map((option) => ({ label: option.label, value: option.code })),
    ],
    [tenancyOptions],
  )

  return (
    <FgCard className="flex items-center gap-3 p-4">
      <FgInput
        leftIcon={<Search aria-hidden className="h-4 w-4" />}
        placeholder="이름 또는 사번"
        rootClassName="flex-1"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgSelect
        className="w-52"
        options={roleOptions}
        value={filter.role}
        onValueChange={(value) => onChange({ ...filter, role: value as UserRoleFilter })}
      />
      <FgSelect
        className="w-48"
        options={belongOptions}
        value={filter.tenancyCode}
        onValueChange={(value) => onChange({ ...filter, tenancyCode: value as UserTenancyCodeFilter })}
      />
      <FgSelect
        className="w-48"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) =>
          onChange({ ...filter, status: value as 'ALL' | UserStatus })
        }
      />
      <FgButton leftIcon={<RotateCcw aria-hidden className="h-4 w-4" />} onClick={onReset}>
        초기화
      </FgButton>
    </FgCard>
  )
}
