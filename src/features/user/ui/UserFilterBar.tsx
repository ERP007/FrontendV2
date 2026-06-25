import { useMemo } from 'react'

import { roleLabel } from '@/shared/config/session'
import { FgFilterBar, FgFilterResetButton, FgFilterSearch, FgFilterSelect } from '@/shared/ui'

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
  { label: '전체', value: 'ALL' },
  ...roleValues.map((role) => ({
    label: `${role} · ${roleLabel(role)}`,
    value: role,
  })),
]

const statusOptions = [
  { label: '전체', value: 'ALL' },
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
      { label: '전체', value: 'ALL' },
      ...tenancyOptions.map((option) => ({ label: option.label, value: option.code })),
    ],
    [tenancyOptions],
  )

  return (
    <FgFilterBar actions={<FgFilterResetButton onClick={onReset} />}>
      <FgFilterSearch
        placeholder="이름 또는 사번"
        value={filter.keyword}
        onChange={(event) => onChange({ ...filter, keyword: event.target.value })}
      />
      <FgFilterSelect
        className="w-52"
        label="역할"
        options={roleOptions}
        value={filter.role}
        onValueChange={(value) => onChange({ ...filter, role: value as UserRoleFilter })}
      />
      <FgFilterSelect
        className="w-48"
        label="소속"
        options={belongOptions}
        value={filter.tenancyCode}
        onValueChange={(value) => onChange({ ...filter, tenancyCode: value as UserTenancyCodeFilter })}
      />
      <FgFilterSelect
        className="w-48"
        label="상태"
        options={statusOptions}
        value={filter.status}
        onValueChange={(value) =>
          onChange({ ...filter, status: value as 'ALL' | UserStatus })
        }
      />
    </FgFilterBar>
  )
}
