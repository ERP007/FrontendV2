import { Clock, Lock, Pencil, User as UserIcon } from 'lucide-react'

import { roleLabel } from '@/shared/config/session'
import { cn } from '@/shared/lib/cn'
import { formatDate, formatDateTime, formatDelta } from '@/shared/lib/format'
import { FgAvatar, FgBadge, FgButton, FgCard, FgCardHeader, FgMeta } from '@/shared/ui'

import { ACTIVITY_TYPE_LABELS } from '../model/types'

import type { MyPageResponse, UserActivity } from '../model/types'

function formatRole(profile: MyPageResponse) {
  return `${roleLabel(profile.role)} (${profile.role})`
}

function formatTenancy(profile: MyPageResponse) {
  if (profile.tenancyName && profile.tenancyCode) {
    return `${profile.tenancyName} (${profile.tenancyCode})`
  }

  return profile.tenancyName || profile.tenancyCode || '-'
}

export function MyProfileCard({ profile }: { profile: MyPageResponse }) {
  return (
    <FgCard>
      <FgCardHeader icon={<UserIcon aria-hidden className="h-4 w-4" />} title="본인 정보" />
      <div className="flex gap-10">
        <div className="flex w-48 shrink-0 flex-col items-center gap-3 text-center">
          <FgAvatar size="profile" />
          <div>
            <p className="text-xl font-extrabold text-ink">{profile.name}</p>
            <p className="mt-1 text-meta font-medium text-faint">{profile.employeeNo.toUpperCase()}</p>
          </div>
        <FgBadge variant="primary">{roleLabel(profile.role)}</FgBadge>
        </div>
        <div className="min-w-0 flex-1">
          <dl className="grid grid-cols-2 gap-x-10 gap-y-6">
            <FgMeta label="이메일" value={profile.email || '-'} />
            <FgMeta label="권한" value={formatRole(profile)} />
            <FgMeta label="소속" value={formatTenancy(profile)} />
            <FgMeta label="직급" value={profile.position || '-'} />
            <FgMeta label="가입일" value={formatDate(profile.joinedAt)} />
            <FgMeta label="마지막 로그인" value={formatDateTime(profile.lastLoginAt)} />
          </dl>
          <p className="mt-6 flex items-center gap-1.5 border-t border-line-soft pt-4 text-meta text-faint">
            <Clock aria-hidden className="h-3.5 w-3.5" />
            본인 정보 수정은 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    </FgCard>
  )
}

export interface MyPasswordCardProps {
  changedAt: string
  onChangePassword: () => void
}

export function MyPasswordCard({ changedAt, onChangePassword }: MyPasswordCardProps) {
  return (
    <FgCard className="flex items-center justify-between gap-4" compact>
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-control bg-primary-soft text-primary">
          <Lock aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-body font-bold text-ink">비밀번호</p>
          <p className="mt-0.5 text-meta font-medium text-faint">마지막 변경 · {changedAt}</p>
        </div>
      </div>
      <FgButton
        leftIcon={<Pencil aria-hidden className="h-4 w-4" />}
        variant="soft"
        onClick={onChangePassword}
      >
        비밀번호 변경
      </FgButton>
    </FgCard>
  )
}

function ActivityTag({ type }: { type: UserActivity['type'] }) {
  return (
    <FgBadge
      className={cn('rounded-badge border-dashed', type === 'ADJUST' ? undefined : 'bg-surface')}
      variant={type === 'ADJUST' ? 'primary' : 'outline'}
    >
      {ACTIVITY_TYPE_LABELS[type]}
    </FgBadge>
  )
}

export function MyActivityCard({ activities }: { activities: UserActivity[] }) {
  return (
    <FgCard>
      <FgCardHeader
        actions={<span className="text-meta font-medium text-faint">최근 {activities.length}건</span>}
        icon={<Clock aria-hidden className="h-4 w-4" />}
        title="최근 활동"
      />
      <div className="divide-y divide-line-soft">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 py-3.5">
            <span className="w-36 shrink-0 text-meta font-medium text-muted">
              {formatDateTime(activity.occurredAt)}
            </span>
            <span className="w-24 shrink-0">
              <ActivityTag type={activity.type} />
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-2 text-label">
              <span className="truncate font-semibold text-ink-2">{activity.description}</span>
              {activity.refCode ? (
                <span className="shrink-0 text-meta font-medium text-faint">{activity.refCode}</span>
              ) : null}
              {activity.delta !== null ? (
                <span
                  className={cn(
                    'shrink-0 font-bold',
                    activity.delta < 0 ? 'text-danger' : 'text-success',
                  )}
                >
                  {formatDelta(activity.delta)}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </FgCard>
  )
}
