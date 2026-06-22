import { RefreshCw } from 'lucide-react'

import {
  getMeErrorMessage,
  MY_ACTIVITY_FIXTURES,
  MyActivityCard,
  MyPasswordCard,
  MyProfileCard,
  useMeQuery,
} from '@/features/user'
import { PASSWORD_CHANGE_URL } from '@/shared/api'
import { formatDate } from '@/shared/lib/format'
import { FgButton, FgNotice, FgPageHeader } from '@/shared/ui'

export function MyPage() {
  const meQuery = useMeQuery()
  const me = meQuery.data
  const errorMessage = meQuery.isError ? getMeErrorMessage(meQuery.error) : null

  return (
    <div className="fg-content max-w-content-narrow">
      <FgPageHeader breadcrumbs={[{ label: '설정' }, { label: '마이페이지' }]} title="마이페이지" />
      {meQuery.isLoading ? <FgNotice>마이페이지 정보를 불러오는 중입니다.</FgNotice> : null}
      {errorMessage ? (
        <div className="space-y-3">
          <FgNotice tone="danger">{errorMessage}</FgNotice>
          <FgButton
            leftIcon={<RefreshCw aria-hidden className="h-4 w-4" />}
            size="sm"
            variant="soft"
            onClick={() => void meQuery.refetch()}
          >
            다시 시도
          </FgButton>
        </div>
      ) : null}
      {me ? <MyProfileCard profile={me} /> : null}
      {me ? (
        <MyPasswordCard
          changedAt={formatDate(me.lastChangedPassAt)}
          onChangePassword={() => window.location.assign(PASSWORD_CHANGE_URL)}
        />
      ) : null}
      <MyActivityCard activities={MY_ACTIVITY_FIXTURES} />
    </div>
  )
}
